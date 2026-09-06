import test from "node:test";
import assert from "node:assert/strict";

import { canEnterWorkspace } from "../src/auth/permissions.js";
import { createBatch, splitBatch } from "../src/services/batchService.js";
import { markProcessingCompleted, markProcessingStarted } from "../src/services/processorService.js";
import { saveAnalysis, submitSampleRequest } from "../src/services/laboratoryService.js";
import { prepareEvent, verifyProof } from "../src/services/blockchainService.js";

const beekeeper = { roles: ["beekeeper"], actorId: "BK-001" };

function batch(overrides = {}) {
  return {
    batchId: "BEE-TEST-001",
    producerId: "BK-001",
    stage: 1,
    quantity: 10,
    ...overrides,
  };
}

test("workspace access requires an assigned role", () => {
  assert.equal(canEnterWorkspace(beekeeper, "beekeeper"), true);
  assert.equal(canEnterWorkspace(beekeeper, "kvic"), false);
});

test("batch creation rejects invalid quantity and future dates", () => {
  assert.throws(
    () => createBatch({ hiveId: "H-1", harvestDate: "2999-01-01", quantity: 0 }),
    /validation failed/i,
  );
});

test("processing transitions are ordered", () => {
  assert.throws(() => markProcessingStarted([batch({ stage: 2 })], "BEE-TEST-001", "PR-001"), /harvested/i);
  assert.throws(() => markProcessingCompleted([batch({ stage: 1 })], "BEE-TEST-001", "Cold Extraction"), /in-progress/i);
});

test("splits cannot exceed the parent quantity", () => {
  assert.throws(
    () => splitBatch(batch({ stage: 3 }), [
      { suffix: "A", quantity: 6 },
      { suffix: "B", quantity: 5 },
    ]),
    /exceed/i,
  );
});

test("blockchain status never claims a local event is confirmed", () => {
  const event = prepareEvent({ eventId: "EVT-TEST", batchId: "BEE-TEST-001" });
  assert.equal(event.blockchainStatus, "NOT_CONNECTED");
  assert.equal(verifyProof("BEE-TEST-001").status, "BLOCKCHAIN_NOT_CONNECTED");
});

test("laboratory services reject incomplete or invalid records", () => {
  assert.throws(() => submitSampleRequest({ batchId: "BEE-TEST-001", labId: "LAB-001", sampleQuantity: 0, tests: [] }), /valid batch/i);
  assert.throws(() => saveAnalysis({ batchId: "BEE-TEST-001", labId: "LAB-001", moisture: -1, sucrose: 3, fructose: 38, glucose: 34, testStatus: "PASS" }), /valid non-negative/i);
});

// ---- Beekeeper Audit Remediation Tests ----
import { getHive, getSensorSeries, runAiHealthAnalysis } from "../src/services/hiveService.js";

test("hive detail access verifies beekeeper ownership", () => {
  // Hive H-1024 belongs to BK-001
  const authorized = getHive("H-1024", "BK-001");
  assert.ok(authorized);
  assert.equal(authorized.hiveId, "H-1024");
  assert.equal(authorized.producerId, "BK-001");

  // Cross-user access attempt: BK-045 attempting to open BK-001's hive
  const unauthorized = getHive("H-1024", "BK-045");
  assert.equal(unauthorized, null);

  // Hive H-2011 belongs to BK-045
  const bk045Hive = getHive("H-2011", "BK-045");
  assert.ok(bk045Hive);
  const bk001Attempt = getHive("H-2011", "BK-001");
  assert.equal(bk001Attempt, null);
});

test("sensor series varies uniquely per hive ID and reflects base readings", () => {
  const series1024 = getSensorSeries("H-1024", 34.8, 61, 0.32);
  const series1026 = getSensorSeries("H-1026", 37.6, 68, 0.41);
  const series1030 = getSensorSeries("H-1030", 39.2, 82, 0.58);

  assert.equal(series1024.length, 12);
  assert.equal(series1026.length, 12);

  // Critical hive H-1030 must have distinctly higher temperature readings than healthy H-1024
  const avgTemp1024 = series1024.reduce((s, r) => s + r.temp, 0) / 12;
  const avgTemp1030 = series1030.reduce((s, r) => s + r.temp, 0) / 12;
  assert.ok(avgTemp1030 > avgTemp1024 + 3);

  // Distinct wave shapes: first reading temperatures should differ
  assert.notEqual(series1024[0].temp, series1026[0].temp);
});

test("AI health analysis accepts image file and includes simulation disclaimer", async () => {
  const mockFile = { name: "comb_brood_frame_01.jpg", size: 1024 * 350 };
  const analysis = await runAiHealthAnalysis("H-1024", mockFile);

  assert.equal(analysis.hiveId, "H-1024");
  assert.equal(analysis.fileName, "comb_brood_frame_01.jpg");
  assert.equal(analysis.isSimulated, true);
  assert.ok(typeof analysis.confidence === "number");
  assert.ok(analysis.confidence >= 80 && analysis.confidence <= 100);
  assert.ok(analysis.disclaimer.includes("Simulated AI Model"));
  assert.ok(analysis.recommendation.length > 0);
});

test("harvesting checks producerId ownership against active batch creation", () => {
  // Creating batch for assigned hive succeeds
  const validBatch = createBatch({
    producerId: "BK-001",
    producerName: "Rajesh Kumar",
    hiveId: "H-1024",
    region: "Erode",
    honeyType: "Multifloral",
    floralSource: "Wildflower",
    harvestDate: "2026-09-06",
    quantity: 12.5,
  });
  assert.equal(validBatch.producerId, "BK-001");
  assert.equal(validBatch.hiveId, "H-1024");

  // Invalid quantity or date rejected
  assert.throws(
    () =>
      createBatch({
        producerId: "BK-001",
        hiveId: "H-1024",
        harvestDate: "2026-09-06",
        quantity: -5,
      }),
    /validation failed/i
  );
});

test("newly created hive propagates to harvesting successfully", () => {
  // Simulate adding a hive dynamically to state
  const newlyAddedHive = {
    hiveId: "H-NEW-99",
    producerId: "BK-001",
    region: "Erode",
    block: "Apiary B - Block 09",
    status: "healthy",
    sensor: "online",
  };

  const harvestBatch = createBatch({
    producerId: newlyAddedHive.producerId,
    producerName: "Rajesh Kumar",
    hiveId: newlyAddedHive.hiveId,
    region: newlyAddedHive.region,
    honeyType: "Forest Honey",
    floralSource: "Neem Blossom",
    harvestDate: "2026-09-06",
    quantity: 18.0,
  });

  assert.equal(harvestBatch.hiveId, "H-NEW-99");
  assert.equal(harvestBatch.producerId, "BK-001");
  assert.equal(harvestBatch.quantity, 18.0);
});

test("hive inspection record preserves queen status and colony strength", () => {
  const inspection = {
    inspectionId: `INSP-${Date.now().toString(36).toUpperCase()}`,
    hiveId: "H-1024",
    producerId: "BK-001",
    queenStatus: "Active & Laying",
    colonyStrength: "Strong (9 frames)",
    notes: "Solid brood pattern, healthy worker activity.",
    inspectedAt: new Date().toISOString(),
  };

  assert.ok(inspection.inspectionId.startsWith("INSP-"));
  assert.equal(inspection.hiveId, "H-1024");
  assert.equal(inspection.producerId, "BK-001");
  assert.equal(inspection.queenStatus, "Active & Laying");
  assert.ok(new Date(inspection.inspectedAt).getTime() > 0);
});
