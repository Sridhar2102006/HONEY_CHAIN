import { Router } from 'express';
import { query, pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import {
  validateBatchCreation,
  validateBatchTransition,
  validateBatchSplit,
} from '../services/batchStateMachine.js';

const router = Router();

function formatBatch(row) {
  if (!row) return null;
  return {
    batchId: row.batch_id,
    producerId: row.producer_id,
    producerName: row.producer_name,
    hiveId: row.hive_id,
    region: row.region,
    honeyType: row.honey_type,
    floralSource: row.floral_source,
    harvestDate: row.harvest_date,
    quantity: row.quantity ? parseFloat(row.quantity) : 0,
    processorId: row.processor_id,
    processingMethod: row.processing_method,
    processingStatus: row.processing_status,
    labId: row.lab_id,
    testStatus: row.test_status,
    certificateId: row.certificate_id,
    certStatus: row.cert_status,
    stage: row.stage,
    parentBatchId: row.parent_batch_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/v1/batches
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { producerId, processorId, stage, certStatus } = req.query;
    let sql = 'SELECT * FROM batches WHERE 1=1';
    const params = [];
    let idx = 1;

    if (producerId) { sql += ` AND producer_id = $${idx++}`; params.push(producerId); }
    if (processorId) { sql += ` AND processor_id = $${idx++}`; params.push(processorId); }
    if (stage !== undefined && stage !== null && stage !== '') {
      const stageInt = parseInt(stage, 10);
      if (!Number.isInteger(stageInt) || stageInt < 1 || stageInt > 10) {
        return res.status(400).json({ error: 'stage must be an integer between 1 and 10' });
      }
      sql += ` AND stage = $${idx++}`; params.push(stageInt);
    }
    if (certStatus) { sql += ` AND cert_status = $${idx++}`; params.push(certStatus); }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params);
    res.json(rows.map(formatBatch));
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/batches/:batchId
router.get('/:batchId', requireAuth, async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const { rows } = await query('SELECT * FROM batches WHERE batch_id = $1', [batchId]);
    if (!rows[0]) {
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }
    res.json(formatBatch(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/batches (Harvest new batch)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      batchId,
      producerId,
      producerName,
      hiveId,
      region,
      honeyType,
      floralSource,
      harvestDate,
      quantity,
      processorId,
    } = req.body;

    // 1. Validate batch creation via state machine
    try {
      validateBatchCreation(req.body, req.user);
    } catch (valErr) {
      return res.status(valErr.statusCode || 400).json({ error: valErr.message });
    }

    // 2. IDOR Protection: Caller cannot assign arbitrary producer unless admin/KVIC
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));
    let effectiveProducerId = req.user.multiActorIds?.beekeeper || req.user.actorId;
    if (producerId && producerId !== effectiveProducerId && !isPrivileged) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to harvest or register batches for another producer',
      });
    }
    if (producerId && isPrivileged) {
      effectiveProducerId = producerId;
    }

    // 3. Hive ownership validation
    if (hiveId) {
      const { rows: hiveRows } = await query('SELECT producer_id FROM hives WHERE hive_id = $1', [hiveId]);
      if (hiveRows.length > 0 && hiveRows[0].producer_id !== effectiveProducerId && !isPrivileged) {
        return res.status(403).json({
          error: `Forbidden: Hive ${hiveId} belongs to producer ${hiveRows[0].producer_id}, not your account (${effectiveProducerId})`,
        });
      }
    }

    const generatedId = batchId || `BEE-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const effectiveProducerName = producerName || req.user.name;

    const { rows } = await query(
      `INSERT INTO batches (
        batch_id, producer_id, producer_name, hive_id, region,
        honey_type, floral_source, harvest_date, quantity,
        processor_id, stage, processing_status, test_status, cert_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, 'Pending', 'PENDING', 'PENDING')
      RETURNING *`,
      [
        generatedId,
        effectiveProducerId,
        effectiveProducerName,
        hiveId || null,
        region || 'Erode',
        honeyType || 'Multifloral',
        floralSource || 'Wildflower',
        harvestDate || new Date().toISOString().slice(0, 10),
        parseFloat(quantity),
        processorId || 'PR-001',
      ]
    );

    res.status(201).json(formatBatch(rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Batch ID '${req.body.batchId}' already exists.` });
    }
    next(err);
  }
});

// PATCH /api/v1/batches/:batchId
router.patch('/:batchId', requireAuth, async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const {
      stage,
      processingStatus,
      processingMethod,
      processorId,
      labId,
      testStatus,
      certificateId,
      certStatus,
      quantity,
    } = req.body;

    // ── Authorization & State Machine: fetch complete batch first ───────────
    const { rows: existing } = await query(
      'SELECT * FROM batches WHERE batch_id = $1',
      [batchId]
    );
    if (!existing[0]) {
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));
    const isProducer =
      existing[0].producer_id === req.user.actorId ||
      existing[0].producer_id === req.user.multiActorIds?.beekeeper;
    const isAssignedProcessor =
      existing[0].processor_id === req.user.actorId ||
      existing[0].processor_id === req.user.multiActorIds?.processor;
    if (!isPrivileged && !isProducer && !isAssignedProcessor) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this batch' });
    }

    // ── State Machine Transition & Invariant Validation ──────────────────────
    try {
      validateBatchTransition(existing[0], req.body, req.user);
    } catch (smErr) {
      return res.status(smErr.statusCode || 400).json({ error: smErr.message });
    }
    // ────────────────────────────────────────────────────────────────────────

    const updates = ['updated_at = NOW()'];
    const params = [batchId];
    let idx = 2;

    if (stage !== undefined) { updates.push(`stage = $${idx++}`); params.push(stage); }
    if (processingStatus !== undefined) { updates.push(`processing_status = $${idx++}`); params.push(processingStatus); }
    if (processingMethod !== undefined) { updates.push(`processing_method = $${idx++}`); params.push(processingMethod); }
    if (processorId !== undefined) { updates.push(`processor_id = $${idx++}`); params.push(processorId); }
    if (labId !== undefined) { updates.push(`lab_id = $${idx++}`); params.push(labId); }
    if (testStatus !== undefined) { updates.push(`test_status = $${idx++}`); params.push(testStatus); }
    if (certificateId !== undefined) { updates.push(`certificate_id = $${idx++}`); params.push(certificateId); }
    if (certStatus !== undefined) { updates.push(`cert_status = $${idx++}`); params.push(certStatus); }
    if (quantity !== undefined) { updates.push(`quantity = $${idx++}`); params.push(parseFloat(quantity)); }

    const sql = `UPDATE batches SET ${updates.join(', ')} WHERE batch_id = $1 RETURNING *`;
    const { rows } = await query(sql, params);

    if (!rows[0]) {
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }

    res.json(formatBatch(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/batches/:batchId/split
router.post('/:batchId/split', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { batchId } = req.params;
    const { splits, reason } = req.body; // splits: [{ childBatchId, quantity, honeyType }]

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({ error: 'Splits array is required' });
    }

    await client.query('BEGIN');

    // Get parent batch
    const { rows: parentRows } = await client.query('SELECT * FROM batches WHERE batch_id = $1', [batchId]);
    const parent = parentRows[0];
    if (!parent) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Parent batch ${batchId} not found` });
    }

    // Validate state and mass conservation
    try {
      validateBatchSplit(parent, splits);
    } catch (splitErr) {
      await client.query('ROLLBACK');
      return res.status(splitErr.statusCode || 400).json({ error: splitErr.message });
    }

    const createdChildren = [];
    for (const split of splits) {
      const childId = split.childBatchId || `${batchId}-S${Math.floor(Math.random() * 1000)}`;

      // Insert child batch
      const { rows: childRows } = await client.query(
        `INSERT INTO batches (
          batch_id, producer_id, producer_name, hive_id, region,
          honey_type, floral_source, harvest_date, quantity,
          processor_id, stage, processing_status, parent_batch_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          childId,
          parent.producer_id,
          parent.producer_name,
          parent.hive_id,
          parent.region,
          split.honeyType || parent.honey_type,
          parent.floral_source,
          parent.harvest_date,
          split.quantity,
          parent.processor_id,
          parent.stage,
          parent.processing_status,
          batchId,
        ]
      );

      // Record relationship
      await client.query(
        `INSERT INTO batch_relationships (parent_batch_id, child_batch_id, relationship_type, transformation_date, quantity, reason)
         VALUES ($1, $2, 'SPLIT', CURRENT_DATE, $3, $4)`,
        [batchId, childId, split.quantity, reason || 'Batch split during processing']
      );

      createdChildren.push(formatBatch(childRows[0]));
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: `Batch ${batchId} split into ${createdChildren.length} child batches`,
      children: createdChildren,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
