/**
 * batchService.js — MOCK. Later: backend REST API + database (PostgreSQL) +
 * eventually reads/writes reconciled against blockchain proofs.
 */
import { generateBatchId, generateChildBatchId } from "../utils/ids.js";

export function validateBatchInput({ hiveId, harvestDate, quantity }) {
  const errors = {};
  const parsedQuantity = Number(quantity);
  const today = new Date().toISOString().slice(0, 10);

  if (!hiveId || typeof hiveId !== "string") errors.hiveId = "A source hive is required.";
  if (!harvestDate || harvestDate > today) errors.harvestDate = "Harvest date cannot be in the future.";
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) errors.quantity = "Quantity must be greater than zero.";

  return errors;
}

export function createBatch({ producerId, producerName, hiveId, region, honeyType, floralSource, harvestDate, quantity }) {
  const errors = validateBatchInput({ hiveId, harvestDate, quantity });
  if (Object.keys(errors).length > 0) {
    const error = new Error("Batch validation failed.");
    error.code = "VALIDATION_ERROR";
    error.details = errors;
    throw error;
  }

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
  if (!parentBatch || parentBatch.stage !== 3) {
    throw new Error("Only a processed batch can be split.");
  }
  if (!Array.isArray(splits) || splits.length < 2) {
    throw new Error("A split requires at least two child batches.");
  }
  const quantities = splits.map(({ quantity }) => Number(quantity));
  if (quantities.some((quantity) => !Number.isFinite(quantity) || quantity <= 0)) {
    throw new Error("Split quantities must be greater than zero.");
  }
  if (quantities.reduce((total, quantity) => total + quantity, 0) > Number(parentBatch.quantity)) {
    throw new Error("Split quantities cannot exceed the parent batch quantity.");
  }

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
