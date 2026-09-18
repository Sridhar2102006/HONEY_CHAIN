# HoneyChain (BeeCrypt) Security Model & Threat Architecture

## 1. Security Architecture Principles
1. **Never Trust the Client:** Frontend checks in React Router or LocalStorage are strictly for UX routing and display. Every API endpoint enforces authoritative authentication and authorization on the server.
2. **Strict Tenant & Asset Isolation:** Beekeepers can only access and modify their own hives, batches, and sensor streams. Cross-tenant tampering via Object ID (IDOR) is prevented at the SQL/document query layer.
3. **State Machine Immutability:** Supply chain stages must advance monotonically (Harvested -> Processing Started -> Processing Completed -> Lab Testing -> Quality Verified -> Certified). Backward transitions and stage skipping are rejected by the backend state machine.
4. **Least Privilege Role-Based Access Control (RBAC):**
   - `beekeeper`: Manage apiary hives, record extractions, monitor owned sensors and cameras.
   - `processor`: Accept assigned batches, update processing stages, request lab testing, portion batches.
   - `laboratory` / `verifier`: Perform purity chemical analyses, record test results, issue official AGMARK certificates.
   - `retailer`: View authenticated inventory, verify intake batches, display consumer QR codes.
   - `kvic` / `admin`: System administration, user verification, setup token generation, system-wide analytics.
   - `consumer`: Public read-only verification of authentic batches and provenance timeline via `/api/v1/events/public`.

---

## 2. Authentication & Token Management
- **Password Hashing:** Passwords are encrypted with Bcrypt (cost factor 12).
- **Session Tokens:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Token Transport:** Sent via `Authorization: Bearer <token>` header or Secure `HttpOnly` cookie.
- **Login Brute-Force Defense:** Memory rate limiter enforces a maximum of 10 attempts per 15-minute window per IP address on `/api/v1/auth/login`.
- **KVIC Onboarding Tokens:** New beekeepers receive a one-time 32-byte cryptographically random setup token. The server stores only the SHA-256 hash with an expiration TTL; the user redeems it to set their initial password.

---

## 3. Defense Against OWASP Top 10
- **A01: Broken Access Control:** Addressed via `requireAuth`, `requireRole`, and strict asset ownership checks against `req.user.actorId`.
- **A02: Cryptographic Failures:** Strong Bcrypt hashing, TLS enforcement on production endpoints, rejection of insecure placeholder JWT secrets in production mode.
- **A03: Injection:** Parameterized queries using PostgreSQL `$1, $2` prepared statements via `pg.pool`; MongoDB BSON object validation.
- **A04: Insecure Design:** Strict backend finite state machine for batch transitions; conservation of mass checks on batch splits.
- **A05: Security Misconfiguration:** Helmet middleware enabled; CORS restricted to verified origins; removal of destructive test routes (`health/clean`).
- **A06: Vulnerable & Outdated Components:** Regular dependency audits and targeted patching of vulnerable dependencies.
- **A07: Identification & Authentication Failures:** Removal of silent fallback to demo users; rate limiting on auth routes; secure setup token lifecycle.
- **A08: Software & Data Integrity Failures:** SHA-256 payload chaining on provenance events (`previous_event_hash`); removal of CI test failure suppression.
- **A09: Security Logging & Monitoring:** Request and error logging with distinct subsystem prefixes and timestamps.
- **A10: Server-Side Request Forgery (SSRF):** Strict RFC1918 private IP validation on ESP32 camera trigger requests; rejection of cloud metadata endpoints (`169.254.169.254`).
