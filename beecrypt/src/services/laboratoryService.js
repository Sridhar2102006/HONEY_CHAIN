/**
 * laboratoryService.js — MOCK. Later: backend endpoints for lab intake,
 * LIMS integration, and report storage.
 */
import { generateTestId } from "../utils/ids.js";

export function submitSampleRequest({ batchId, labId, sampleQuantity, tests, requestedDate, notes }) {
  const quantity = Number(sampleQuantity);
  if (!batchId || !labId || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("A valid batch, laboratory, and positive sample quantity are required.");
  }
  if (!Array.isArray(tests) || tests.length === 0) {
    throw new Error("At least one laboratory test is required.");
  }

  return {
    requestId: `REQ-${Math.floor(100 + Math.random() * 900)}`,
    batchId,
    labId,
    sampleQuantityMl: Number(sampleQuantity),
    tests,
    requestedDate,
    notes: notes || "",
    status: "Pending Laboratory Acceptance",
  };
}

export function saveAnalysis({ batchId, labId, moisture, sucrose, fructose, glucose, adulteration, testStatus, verifierId }) {
  const values = [moisture, sucrose, fructose, glucose].map(Number);
  if (!batchId || !labId || values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Analysis values must be valid non-negative numbers.");
  }
  if (!["PASS", "FAIL"].includes(testStatus)) {
    throw new Error("Analysis status must be PASS or FAIL.");
  }

  return {
    testId: generateTestId(),
    batchId,
    labId,
    testDate: new Date().toISOString().slice(0, 10),
    moisture: Number(moisture),
    sucrose: Number(sucrose),
    fructose: Number(fructose),
    glucose: Number(glucose),
    adulteration,
    testStatus,
    verifierId,
  };
}
