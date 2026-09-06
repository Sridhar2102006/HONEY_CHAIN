/**
 * processorService.js — MOCK. Later: backend endpoints for processing
 * lifecycle + facility management.
 */
export function markProcessingStarted(batches, batchId, processorId) {
  const batch = batches.find((item) => item.batchId === batchId);
  if (!batch) throw new Error("Batch not found.");
  if (batch.stage !== 1) throw new Error("Only a harvested batch can enter processing.");
  if (!processorId) throw new Error("A processor identity is required.");

  return batches.map((b) =>
    b.batchId === batchId ? { ...b, processorId, processingStatus: "In Progress", stage: 2 } : b
  );
}

export function markProcessingCompleted(batches, batchId, processingMethod) {
  const batch = batches.find((item) => item.batchId === batchId);
  if (!batch) throw new Error("Batch not found.");
  if (batch.stage !== 2) throw new Error("Only an in-progress batch can be completed.");
  if (!processingMethod) throw new Error("A processing method is required.");

  return batches.map((b) =>
    b.batchId === batchId ? { ...b, processingStatus: "Completed", processingMethod, stage: 3 } : b
  );
}
