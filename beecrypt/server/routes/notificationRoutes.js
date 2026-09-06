import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/notifications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC LIMIT 20',
      [req.user.actorId]
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        text: r.text,
        read: r.read,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ id: rows[0].id, text: rows[0].text, read: rows[0].read });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/alerts
router.get('/alerts', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM alerts ORDER BY occurred_at DESC LIMIT 20');
    res.json(
      rows.map((r) => ({
        alertId: r.alert_id,
        level: r.level,
        hiveId: r.hive_id,
        title: r.title,
        body: r.body,
        read: r.read,
        occurredAt: r.occurred_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
