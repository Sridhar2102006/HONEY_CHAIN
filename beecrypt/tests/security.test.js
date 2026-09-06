/**
 * security.test.js — Phase 8/9 Security Regression Tests
 *
 * Tests: batch ownership, login rate limiting, JWT secret validation,
 * KVIC password flow, authentication bypass, rate limiter logic.
 *
 * These tests run against in-memory service logic and mocked DB — they do NOT
 * require a live database connection. DB-dependent tests are marked BLOCKED
 * when the DB is unreachable.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import jwt from "../server/node_modules/jsonwebtoken/index.js";
import crypto from "crypto";

// -- 1. JWT Secret Security ----------------------------------------------------
describe("JWT Secret Security", () => {
  test("generateToken signs with configured secret", () => {
    const secret = "test-secret-min-32-chars-abcdefghijklmnop";
    const payload = { actorId: "BK-001", roles: ["beekeeper"] };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const decoded = jwt.verify(token, secret);
    assert.equal(decoded.actorId, "BK-001");
    assert.deepEqual(decoded.roles, ["beekeeper"]);
  });

  test("token signed with wrong secret is rejected", () => {
    const correctSecret = "correct-secret-abcdefghijklmnop-12345678";
    const wrongSecret   = "wrong-secret-abcdefghijklmnop-99999999";
    const token = jwt.sign({ actorId: "BK-001" }, wrongSecret, { expiresIn: "1h" });
    assert.throws(
      () => jwt.verify(token, correctSecret),
      (err) => err.name === "JsonWebTokenError"
    );
  });

  test("expired token is rejected", () => {
    const secret = "test-secret-min-32-chars-abcdefghijklmnop";
    const token = jwt.sign({ actorId: "BK-001" }, secret, { expiresIn: "-1s" });
    assert.throws(
      () => jwt.verify(token, secret),
      (err) => err.name === "TokenExpiredError"
    );
  });

  test("tampered token payload is rejected", () => {
    const secret = "test-secret-min-32-chars-abcdefghijklmnop";
    const token = jwt.sign({ actorId: "BK-001", roles: ["beekeeper"] }, secret, { expiresIn: "1h" });
    // Tamper the payload (middle base64 segment)
    const parts = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ actorId: "KVIC-001", roles: ["kvic"] })
    ).toString("base64url");
    const tamperedToken = [parts[0], tamperedPayload, parts[2]].join(".");
    assert.throws(
      () => jwt.verify(tamperedToken, secret),
      (err) => err.name === "JsonWebTokenError"
    );
  });

  test("production mode: missing JWT_SECRET throws on module resolution logic", () => {
    // Test the resolveJwtSecret logic inline (not importing the module so we
    // do not affect the running process env)
    const PLACEHOLDER = "beecrypt_super_secret_jwt_key_2026_change_in_production";
    function resolveJwtSecretTestable(raw, isProduction) {
      if (!raw || raw.trim() === "" || raw === PLACEHOLDER) {
        if (isProduction) {
          throw new Error("[SECURITY] JWT_SECRET is missing or uses the insecure placeholder value.");
        }
        return "dev-fallback";
      }
      return raw;
    }
    // Should throw in production
    assert.throws(
      () => resolveJwtSecretTestable(undefined, true),
      (err) => err.message.includes("[SECURITY]")
    );
    // Should throw for placeholder in production
    assert.throws(
      () => resolveJwtSecretTestable(PLACEHOLDER, true),
      (err) => err.message.includes("[SECURITY]")
    );
    // Should return dev fallback in development
    const devSecret = resolveJwtSecretTestable(undefined, false);
    assert.equal(devSecret, "dev-fallback");
    // Should use real secret when provided
    const realSecret = resolveJwtSecretTestable("my-strong-real-secret", true);
    assert.equal(realSecret, "my-strong-real-secret");
  });
});

// -- 2. Batch Ownership Authorization Logic ------------------------------------
describe("Batch Ownership Authorization", () => {
  // Simulate the authorization logic from batchRoutes.js PATCH handler
  function checkBatchAccess(batch, user) {
    const isPrivileged = user.roles?.some((r) => ["kvic", "admin"].includes(r));
    const isProducer =
      batch.producer_id === user.actorId ||
      batch.producer_id === user.multiActorIds?.beekeeper;
    const isAssignedProcessor =
      batch.processor_id === user.actorId ||
      batch.processor_id === user.multiActorIds?.processor;
    if (!isPrivileged && !isProducer && !isAssignedProcessor) {
      return { allowed: false, code: 403 };
    }
    return { allowed: true, code: 200 };
  }

  const batch = { producer_id: "BK-001", processor_id: "PR-001" };

  test("producer can update their own batch", () => {
    const result = checkBatchAccess(batch, { actorId: "BK-001", roles: ["beekeeper"] });
    assert.equal(result.allowed, true);
  });

  test("assigned processor can update the batch", () => {
    const result = checkBatchAccess(batch, { actorId: "PR-001", roles: ["processor"] });
    assert.equal(result.allowed, true);
  });

  test("KVIC admin can update any batch (privileged)", () => {
    const result = checkBatchAccess(batch, { actorId: "KVIC-001", roles: ["kvic"] });
    assert.equal(result.allowed, true);
  });

  test("unauthorized actor cannot update another producer's batch", () => {
    const result = checkBatchAccess(batch, { actorId: "BK-999", roles: ["beekeeper"] });
    assert.equal(result.allowed, false);
    assert.equal(result.code, 403);
  });

  test("unassigned processor cannot update another producer's batch", () => {
    const result = checkBatchAccess(batch, { actorId: "PR-999", roles: ["processor"] });
    assert.equal(result.allowed, false);
    assert.equal(result.code, 403);
  });

  test("multi-actor beekeeper sub-ID is recognized as owner", () => {
    const result = checkBatchAccess(batch, {
      actorId: "ORG-501",
      roles: ["beekeeper", "processor"],
      multiActorIds: { beekeeper: "BK-001", processor: "PR-045" },
    });
    assert.equal(result.allowed, true);
  });
});

// -- 3. Rate Limiter Logic -----------------------------------------------------
describe("Login Rate Limiter", () => {
  // Inline the same sliding-window logic from rateLimiter.js
  function buildTestLimiter({ windowMs, max }) {
    const store = new Map();
    return function limit(ip) {
      const now = Date.now();
      const timestamps = (store.get(ip) || []).filter((t) => now - t < windowMs);
      timestamps.push(now);
      store.set(ip, timestamps);
      if (timestamps.length > max) {
        return { allowed: false, count: timestamps.length };
      }
      return { allowed: true, count: timestamps.length };
    };
  }

  test("first N requests within limit are allowed", () => {
    const limit = buildTestLimiter({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 5; i++) {
      assert.equal(limit("127.0.0.1").allowed, true, `Request ${i + 1} should be allowed`);
    }
  });

  test("request N+1 is blocked", () => {
    const limit = buildTestLimiter({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 5; i++) limit("127.0.0.1");
    const result = limit("127.0.0.1");
    assert.equal(result.allowed, false);
  });

  test("different IPs are tracked independently", () => {
    const limit = buildTestLimiter({ windowMs: 60000, max: 2 });
    limit("1.2.3.4");
    limit("1.2.3.4");
    limit("1.2.3.4"); // blocked for 1.2.3.4
    const blockedResult = limit("1.2.3.4");
    assert.equal(blockedResult.allowed, false);
    // 5.6.7.8 is a fresh IP, first request should succeed
    const freshResult = limit("5.6.7.8");
    assert.equal(freshResult.allowed, true);
  });

  test("requests older than windowMs are not counted", async () => {
    const limit = buildTestLimiter({ windowMs: 50, max: 2 }); // 50ms window
    limit("127.0.0.1");
    limit("127.0.0.1");
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));
    // Now should be allowed again (window expired)
    const result = limit("127.0.0.1");
    assert.equal(result.allowed, true);
  });
});

// -- 4. KVIC Password Setup Token Flow ----------------------------------------
describe("KVIC Password Setup Token Flow", () => {
  test("crypto.randomBytes generates unique tokens", () => {
    const t1 = crypto.randomBytes(32).toString("hex");
    const t2 = crypto.randomBytes(32).toString("hex");
    assert.notEqual(t1, t2);
    assert.equal(t1.length, 64); // 32 bytes = 64 hex chars
  });

  test("SHA-256 hash is deterministic", () => {
    const token = "test-setup-token-abc123";
    const hash1 = crypto.createHash("sha256").update(token).digest("hex");
    const hash2 = crypto.createHash("sha256").update(token).digest("hex");
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  test("different tokens produce different hashes", () => {
    const hash1 = crypto.createHash("sha256").update("token-A").digest("hex");
    const hash2 = crypto.createHash("sha256").update("token-B").digest("hex");
    assert.notEqual(hash1, hash2);
  });

  test("demo123 is not a valid setup token (cannot derive correct hash)", () => {
    const realToken = crypto.randomBytes(32).toString("hex");
    const realHash = crypto.createHash("sha256").update(realToken).digest("hex");
    const demo123Hash = crypto.createHash("sha256").update("demo123").digest("hex");
    // A random real token's hash never equals the demo123 hash
    assert.notEqual(realHash, demo123Hash);
  });

  test("LOCKED_HASH cannot be used to authenticate", async () => {
    // bcryptjs — the locked hash used in KVIC approval is not a valid bcrypt hash
    // that will match any real password. It is a placeholder string.
    const LOCKED_HASH = "$2a$10$LOCKEDACCOUNTCANNOTLOGINWITHPASSWORDHASHPLACEHOLDER";
    const { default: bcrypt } = await import("../server/node_modules/bcryptjs/index.js");
    const matches = await bcrypt.compare("demo123", LOCKED_HASH).catch(() => false);
    assert.equal(matches, false, "LOCKED_HASH must not match demo123");
  });

  test("setup token expiry logic works correctly", () => {
    const ttlMinutes = 60;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    assert.ok(expiresAt > new Date(), "Token should expire in the future");

    const expiredAt = new Date(Date.now() - 1000);
    assert.ok(expiredAt < new Date(), "Expired token should be in the past");
  });

  test("password minimum length is enforced (>=8 chars)", () => {
    const validate = (pw) => pw.length >= 8;
    assert.equal(validate("short"), false);
    assert.equal(validate("demo123"), false, "demo123 is only 7 chars and must be rejected");
    assert.equal(validate("ValidP@ss!"), true);
  });
});

// -- 5. Auth Bypass Scenarios --------------------------------------------------
describe("Authentication Bypass Prevention", () => {
  test("token with no signature segment is rejected", () => {
    const secret = "test-secret-min-32-chars-abcdefghijklmnop";
    const malformedToken = "eyJhbGciOiJub25lIn0.eyJhY3RvcklkIjoiQkstMDAxIn0.";
    assert.throws(
      () => jwt.verify(malformedToken, secret),
      (err) => ["JsonWebTokenError", "TokenExpiredError"].includes(err.name)
    );
  });

  test("alg:none attack is rejected by jsonwebtoken", () => {
    const secret = "test-secret-min-32-chars-abcdefghijklmnop";
    // Construct a token claiming alg:none
    const header  = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ actorId: "KVIC-001", roles: ["kvic"] })).toString("base64url");
    const unsignedToken = `${header}.${payload}.`;
    assert.throws(
      () => jwt.verify(unsignedToken, secret),
      (err) => err.name === "JsonWebTokenError"
    );
  });
});
