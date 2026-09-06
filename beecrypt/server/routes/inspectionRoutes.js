import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatInspection(row) {
  if (!row) return null;
  return {
    inspectionId: row.inspection_id,
    hiveId: row.hive_id,
    producerId: row.producer_id,
    queenStatus: row.queen_status,
    colonyStrength: row.colony_strength,
    notes: row.notes,
    inspectedAt: row.inspected_at,
  };
}

// GET /api/v1/inspections
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { hiveId } = req.query;
    let sql = 'SELECT * FROM inspections';
    const params = [];

    if (hiveId) {
      sql += ' WHERE hive_id = $1';
      params.push(hiveId);
    }

    sql += ' ORDER BY inspected_at DESC';
    const { rows } = await query(sql, params);
    res.json(rows.map(formatInspection));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/inspections
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { inspectionId, hiveId, producerId, queenStatus, colonyStrength, notes, inspectedAt } = req.body;

    if (!hiveId) {
      return res.status(400).json({ error: 'hiveId is required' });
    }

    const effectiveId = inspectionId || `INSP-${Date.now().toString().slice(-6)}`;
    const effectiveProducer = producerId || req.user.multiActorIds?.beekeeper || req.user.actorId;
    const effectiveDate = inspectedAt || new Date().toISOString();

    const { rows } = await query(
      `INSERT INTO inspections (
        inspection_id, hive_id, producer_id, queen_status, colony_strength, notes, inspected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [effectiveId, hiveId, effectiveProducer, queenStatus || null, colonyStrength || null, notes || null, effectiveDate]
    );

    res.status(201).json(formatInspection(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
