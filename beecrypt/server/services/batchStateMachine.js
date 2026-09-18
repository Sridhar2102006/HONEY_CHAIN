/**
 * batchStateMachine.js
 * Authoritative server-side Finite State Machine (FSM) and quantity invariants
 * for the honey traceability lifecycle.
 */

export const STAGES = {
  1: 'HARVESTED',
  2: 'PROCESSING_STARTED',
  3: 'PROCESSING_DONE',
  4: 'LAB_REQUESTED',
  5: 'QUALITY_VERIFIED',
  6: 'CERTIFIED',
};

export const ALLOWED_TRANSITIONS = {
  1: [2],
  2: [3],
  3: [4],
  4: [5],
  5: [6],
  6: [],
};

export class StateMachineError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    name = 'StateMachineError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates batch creation parameters.
 */
export function validateBatchCreation(payload, user) {
  const { quantity, harvestDate, hiveId } = payload;

  if (quantity === undefined || quantity === null) {
    throw new StateMachineError('Batch quantity is required', 400);
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new StateMachineError('Batch quantity must be a positive number greater than 0', 400);
  }
  if (qty > 50000) {
    throw new StateMachineError('Batch quantity exceeds reasonable apiary harvest limit (50,000 kg)', 400);
  }

  if (harvestDate) {
    const parsedDate = new Date(harvestDate);
    const now = new Date();
    // Allow up to 24 hours in the future for timezone discrepancies
    if (parsedDate.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
      throw new StateMachineError('Harvest date cannot be in the future', 400);
    }
  }

  return true;
}

/**
 * Validates a transition update for an existing batch.
 */
export function validateBatchTransition(existingBatch, updates, user) {
  const currentStage = Number(existingBatch.stage) || 1;
  const isPrivileged = user?.roles?.some((r) => ['kvic', 'admin'].includes(r));

  // 1. Validate quantity changes
  if (updates.quantity !== undefined && updates.quantity !== null) {
    const newQty = Number(updates.quantity);
    if (!Number.isFinite(newQty) || newQty <= 0) {
      throw new StateMachineError('Quantity must be a positive number greater than 0', 400);
    }

    // Quantity locking: once processing has started (Stage >= 2), quantity cannot be arbitrarily altered
    if (currentStage >= 2 && Math.abs(newQty - Number(existingBatch.quantity)) > 0.001) {
      if (!isPrivileged) {
        throw new StateMachineError(
          `Batch quantity is locked at stage ${currentStage} (${STAGES[currentStage] || 'IN_PROGRESS'}) and cannot be modified.`,
          409
        );
      }
    }
  }

  // 2. Validate Stage transition if stage is being updated
  if (updates.stage !== undefined && updates.stage !== null) {
    const nextStage = Number(updates.stage);
    if (!Number.isInteger(nextStage) || nextStage < 1 || nextStage > 6) {
      throw new StateMachineError('Invalid stage: must be an integer between 1 and 6', 400);
    }

    // Disallow backward transition (regression)
    if (nextStage < currentStage) {
      throw new StateMachineError(
        `Stage regression forbidden: cannot transition backward from Stage ${currentStage} (${STAGES[currentStage]}) to Stage ${nextStage} (${STAGES[nextStage]})`,
        400
      );
    }

    // Disallow skipping stages
    if (nextStage > currentStage) {
      if (nextStage !== currentStage + 1) {
        throw new StateMachineError(
          `Stage skipping forbidden: cannot jump from Stage ${currentStage} directly to Stage ${nextStage}. Must advance sequentially to Stage ${currentStage + 1}.`,
          400
        );
      }

      // Check transition prerequisites
      if (nextStage === 2) {
        // Stage 2: Processing Started
        const isProcessor =
          user.roles?.includes('processor') ||
          existingBatch.processor_id === user.actorId ||
          existingBatch.processor_id === user.multiActorIds?.processor;
        if (!isProcessor && !isPrivileged) {
          throw new StateMachineError('Only an authorized processor or admin can initiate processing', 403);
        }
      } else if (nextStage === 3) {
        // Stage 3: Processing Completed
        const method = updates.processingMethod || existingBatch.processing_method;
        if (!method || !method.trim()) {
          throw new StateMachineError('Processing method is required to complete processing', 400);
        }
      } else if (nextStage === 4) {
        // Stage 4: Lab Testing Requested
        const labId = updates.labId || existingBatch.lab_id;
        if (!labId) {
          throw new StateMachineError('Accredited laboratory ID is required for test dispatch', 400);
        }
      } else if (nextStage === 5) {
        // Stage 5: Quality Verified
        const isLab = user.roles?.some((r) => ['laboratory', 'verifier'].includes(r));
        if (!isLab && !isPrivileged) {
          throw new StateMachineError('Only an accredited laboratory or admin can verify honey quality', 403);
        }
      } else if (nextStage === 6) {
        // Stage 6: Certified
        const isLabOrAdmin = user.roles?.some((r) => ['laboratory', 'verifier', 'kvic', 'admin'].includes(r));
        if (!isLabOrAdmin) {
          throw new StateMachineError('Only an authorized laboratory or regulatory admin can issue certification', 403);
        }
        const testStatus = updates.testStatus || existingBatch.test_status;
        if (testStatus !== 'PASS') {
          throw new StateMachineError('Cannot certify a batch that has not passed laboratory quality testing', 400);
        }
      }
    }
  }

  return true;
}

/**
 * Validates batch splitting conservation of mass.
 */
export function validateBatchSplit(parentBatch, splits) {
  const currentStage = Number(parentBatch.stage) || 1;
  if (currentStage < 3) {
    throw new StateMachineError(
      `Cannot split batch in Stage ${currentStage}. Batch must be at least Stage 3 (Processing Completed) or Stage 6 (Certified) before portioning.`,
      400
    );
  }

  if (!Array.isArray(splits) || splits.length < 2) {
    throw new StateMachineError('A batch split requires at least two child portions', 400);
  }

  let totalChildQuantity = 0;
  for (const [idx, child] of splits.entries()) {
    const qty = Number(child.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new StateMachineError(`Child portion #${idx + 1} must have a positive quantity greater than 0`, 400);
    }
    totalChildQuantity += qty;
  }

  const parentQty = Number(parentBatch.quantity);
  // Total of child quantities cannot exceed parent quantity
  if (totalChildQuantity > parentQty + 0.001) {
    throw new StateMachineError(
      `Conservation of mass violation: Sum of split portions (${totalChildQuantity.toFixed(2)} kg) exceeds parent batch volume (${parentQty.toFixed(2)} kg)`,
      400
    );
  }

  return true;
}
