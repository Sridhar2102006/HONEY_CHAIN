/**
 * batchService.js — MOCK. Later: backend REST API + database (PostgreSQL) +
 * eventually reads/writes reconciled against blockchain proofs.
 */
import { generateBatchId, generateChildBatchId } from "../utils/ids.js";

export function createBatch({ producerId, producerName, hiveId, region, honeyType, floralSource, harvestDate, quantity }) {
  const batchId = generateBatchId();
  return {
    batchId,
    producerId,
    producerName,
    hiveId,
    region,
    honeyType,
    floralSource,
    harvestDate,
    quantity: Number(quantity),
    processorId: null,
    processingMethod: null,
    processingStatus: "Pending",
    labId: null,
    testStatus: "PENDING",
    certificateId: null,
    certStatus: "PENDING",
    stage: 1,
    parentBatchId: null,
  };
}

export function splitBatch(parentBatch, splits) {
  // splits: [{ suffix: "A", quantity }, { suffix: "B", quantity }]
  const relationships = [];
  const children = splits.map(({ suffix, quantity, reason }) => {
    const childBatchId = generateChildBatchId(parentBatch.batchId, suffix);
    relationships.push({
      parentBatchId: parentBatch.batchId,
      childBatchId,
      relationshipType: "SPLIT",
      transformationDate: new Date().toISOString().slice(0, 10),
      quantity,
      reason: reason || "Batch split",
    });
    return {
      ...parentBatch,
      batchId: childBatchId,
      quantity,
      parentBatchId: parentBatch.batchId,
      stage: parentBatch.stage,
    };
  });
  return { children, relationships };
}

export function updateBatch(batches, batchId, patch) {
  return batches.map((b) => (b.batchId === batchId ? { ...b, ...patch } : b));
}

export function findBatch(batches, batchId) {
  return batches.find((b) => b.batchId === batchId) || null;
}

export function childrenOf(relationships, batchId) {
  return relationships.filter((r) => r.parentBatchId === batchId);
}
