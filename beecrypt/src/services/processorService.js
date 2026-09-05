/**
 * processorService.js — MOCK. Later: backend endpoints for processing
 * lifecycle + facility management.
 */
export function markProcessingStarted(batches, batchId, processorId) {
  return batches.map((b) =>
    b.batchId === batchId ? { ...b, processorId, processingStatus: "In Progress", stage: 2 } : b
  );
}

export function markProcessingCompleted(batches, batchId, processingMethod) {
  return batches.map((b) =>
    b.batchId === batchId ? { ...b, processingStatus: "Completed", processingMethod, stage: 3 } : b
  );
}
