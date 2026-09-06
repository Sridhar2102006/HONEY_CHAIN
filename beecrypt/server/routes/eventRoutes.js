import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatEvent(row) {
  if (!row) return null;
  return {
    eventId: row.event_id,
    batchId: row.batch_id,
    eventType: row.event_type,
    actorId: row.actor_id,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    payload: row.payload,
    payloadHash: row.payload_hash,
    previousEventHash: row.previous_event_hash,
    signature: row.signature,
    blockchainTx: row.blockchain_tx,
    blockchainStatus: row.blockchain_status,
  };
}

// GET /api/v1/events?batchId=...
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { batchId } = req.query;
    let sql = 'SELECT * FROM provenance_events';
    const params = [];

    if (batchId) {
      sql += ' WHERE batch_id = $1';
      params.push(batchId);
    }

    sql += ' ORDER BY occurred_at ASC, id ASC';
    const { rows } = await query(sql, params);
    res.json(rows.map(formatEvent));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events (Record provenance event with cryptographic hash chaining)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { eventId, batchId, eventType, actorId, occurredAt, payload } = req.body;

    if (!batchId || !eventType) {
      return res.status(400).json({ error: 'batchId and eventType are required' });
    }

    const effectiveEventId = eventId || `EVT-${Date.now().toString().slice(-6)}`;
    const effectiveActorId = actorId || req.user.actorId;
    const effectiveOccurredAt = occurredAt || new Date().toISOString();
    const effectivePayload = payload || {};

    // 1. Get the last event for this batch to link previous_event_hash
    const { rows: lastEventRows } = await query(
      'SELECT payload_hash FROM provenance_events WHERE batch_id = $1 ORDER BY occurred_at DESC, id DESC LIMIT 1',
      [batchId]
    );
    const previousEventHash = lastEventRows[0]?.payload_hash || null;

    // 2. Compute deterministic SHA-256 payload hash
    const dataToHash = JSON.stringify({
      batchId,
      eventType,
      actorId: effectiveActorId,
      occurredAt: effectiveOccurredAt,
      payload: effectivePayload,
      previousEventHash,
    });
    const payloadHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const { rows } = await query(
      `INSERT INTO provenance_events (
        event_id, batch_id, event_type, actor_id,
        occurred_at, recorded_at, payload,
        payload_hash, previous_event_hash,
        blockchain_status
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, 'NOT_CONNECTED')
      RETURNING *`,
      [
        effectiveEventId,
        batchId,
        eventType,
        effectiveActorId,
        effectiveOccurredAt,
        effectivePayload,
        payloadHash,
        previousEventHash,
      ]
    );

    res.status(201).json(formatEvent(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
