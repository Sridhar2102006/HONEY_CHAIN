/**
 * laboratoryService.js — MOCK. Later: backend endpoints for lab intake,
 * LIMS integration, and report storage.
 */
import { generateTestId } from "../utils/ids.js";

export function submitSampleRequest({ batchId, labId, sampleQuantity, tests, requestedDate, notes }) {
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
