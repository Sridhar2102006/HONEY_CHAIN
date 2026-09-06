import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Helper to convert DB snake_case to frontend camelCase
function formatHive(row) {
  if (!row) return null;
  return {
    hiveId: row.hive_id,
    producerId: row.producer_id,
    region: row.region,
    block: row.block,
    status: row.status,
    temp: row.temp ? parseFloat(row.temp) : null,
    humidity: row.humidity,
    vibration: row.vibration ? parseFloat(row.vibration) : null,
    sensor: row.sensor,
    battery: row.battery,
    createdAt: row.created_at,
  };
}

// GET /api/v1/hives
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { producerId } = req.query;
    let sql = 'SELECT * FROM hives';
    const params = [];

    // Filter by producer if requested or if caller is a standard beekeeper
    const targetProducer = producerId || req.user.actorId;
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));

    if (!isPrivileged || producerId) {
      sql += ' WHERE producer_id = $1';
      params.push(targetProducer);
    }

    sql += ' ORDER BY hive_id ASC';
    const { rows } = await query(sql, params);
    res.json(rows.map(formatHive));
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/hives/:hiveId
router.get('/:hiveId', requireAuth, async (req, res, next) => {
  try {
    const { hiveId } = req.params;
    const { rows } = await query('SELECT * FROM hives WHERE hive_id = $1', [hiveId]);
    const hive = rows[0];

    if (!hive) {
      return res.status(404).json({ error: `Hive ${hiveId} not found` });
    }

    // Ownership check (Critical audit fix)
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));
    const isOwner =
      hive.producer_id === req.user.actorId ||
      hive.producer_id === req.user.multiActorIds?.beekeeper;

    if (!isPrivileged && !isOwner) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to view this hive',
      });
    }

    res.json(formatHive(hive));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/hives
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { hiveId, producerId, region, block, status, temp, humidity, vibration, sensor, battery } = req.body;

    if (!hiveId) {
      return res.status(400).json({ error: 'hiveId is required' });
    }

    const assignedProducer = producerId || req.user.multiActorIds?.beekeeper || req.user.actorId;

    const { rows } = await query(
      `INSERT INTO hives (hive_id, producer_id, region, block, status, temp, humidity, vibration, sensor, battery)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        hiveId,
        assignedProducer,
        region || 'Erode',
        block || 'Apiary Block 01',
        status || 'healthy',
        temp || 34.5,
        humidity || 60,
        vibration || 0.3,
        sensor || 'online',
        battery || 100,
      ]
    );

    res.status(201).json(formatHive(rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Hive ID '${req.body.hiveId}' already exists.` });
    }
    next(err);
  }
});

// PATCH /api/v1/hives/:hiveId
router.patch('/:hiveId', requireAuth, async (req, res, next) => {
  try {
    const { hiveId } = req.params;
    const { status, temp, humidity, vibration, sensor, battery, block, region } = req.body;

    // Ownership/privilege check before allowing mutation
    const { rows: hiveRows } = await query('SELECT producer_id FROM hives WHERE hive_id = $1', [hiveId]);
    if (!hiveRows[0]) {
      return res.status(404).json({ error: `Hive ${hiveId} not found` });
    }
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));
    const isOwner =
      hiveRows[0].producer_id === req.user.actorId ||
      hiveRows[0].producer_id === req.user.multiActorIds?.beekeeper;
    if (!isPrivileged && !isOwner) {
      return res.status(403).json({ error: 'Forbidden: You do not own this hive' });
    }

    const updates = [];
    const params = [hiveId];
    let idx = 2;

    if (status !== undefined) { updates.push(`status = $${idx++}`); params.push(status); }
    if (temp !== undefined) { updates.push(`temp = $${idx++}`); params.push(temp); }
    if (humidity !== undefined) { updates.push(`humidity = $${idx++}`); params.push(humidity); }
    if (vibration !== undefined) { updates.push(`vibration = $${idx++}`); params.push(vibration); }
    if (sensor !== undefined) { updates.push(`sensor = $${idx++}`); params.push(sensor); }
    if (battery !== undefined) { updates.push(`battery = $${idx++}`); params.push(battery); }
    if (block !== undefined) { updates.push(`block = $${idx++}`); params.push(block); }
    if (region !== undefined) { updates.push(`region = $${idx++}`); params.push(region); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const sql = `UPDATE hives SET ${updates.join(', ')} WHERE hive_id = $1 RETURNING *`;
    const { rows } = await query(sql, params);

    if (!rows[0]) {
      return res.status(404).json({ error: `Hive ${hiveId} not found` });
    }

    res.json(formatHive(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
