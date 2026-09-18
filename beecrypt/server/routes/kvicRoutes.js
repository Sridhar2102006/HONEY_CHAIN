import { Router } from 'express';
import crypto from 'crypto';
import { query, pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/kvic/applications
router.get('/applications', requireAuth, requireRole('kvic', 'admin'), async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM pending_applications ORDER BY created_at DESC');
    res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        roles: r.roles,
        region: r.region,
        docs: r.docs,
        status: r.status,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/kvic/applications/:id
router.patch('/applications/:id', requireAuth, requireRole('kvic', 'admin'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Approved' or 'Rejected'" });
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      'UPDATE pending_applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (!rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = rows[0];

    // If approved, create the user with default password 'demo123' if they don't already exist
    if (status === 'Approved') {
      // ── Secure onboarding: generate a one-time setup token ──────────────────
      // 1. Generate a cryptographically-random 32-byte token (plaintext).
      const setupTokenPlain = crypto.randomBytes(32).toString('hex');
      // 2. Store only its SHA-256 hash in the DB — never the plaintext.
      const setupTokenHash = crypto.createHash('sha256').update(setupTokenPlain).digest('hex');
      const ttlMinutes = parseInt(process.env.SETUP_TOKEN_TTL_MINUTES || '60', 10);
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      // 3. Insert/update user with a LOCKED password (unusable bcrypt hash),
      //    must_change_password=true, and the hashed setup token.
      const LOCKED_HASH = '$2a$10$LOCKEDACCOUNTCANNOTLOGINWITHPASSWORDHASHPLACEHOLDER';
      const actorPrefix = app.roles[0]?.toUpperCase().slice(0, 2) || 'USR';
      const actorId = `${actorPrefix}-${Math.floor(100 + Math.random() * 900)}`;

      await client.query(
        `INSERT INTO users
           (actor_id, org_id, name, email, password_hash, roles, region,
            setup_token, setup_token_expires, must_change_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
         ON CONFLICT (email) DO UPDATE SET
           roles                = EXCLUDED.roles,
           setup_token          = EXCLUDED.setup_token,
           setup_token_expires  = EXCLUDED.setup_token_expires,
           must_change_password = TRUE`,
        [
          actorId,
          'ORG-999',
          app.name,
          app.email,
          LOCKED_HASH,
          app.roles,
          app.region || 'Tamil Nadu',
          setupTokenHash,
          expiresAt,
        ]
      );
      // ── NOTE: In production, email this token to app.email securely. ────────
      // Here we return it in the response so the KVIC admin can relay it.
      // The plaintext token is never stored and is not retrievable after this call.
      await client.query('COMMIT');
      client.release();
      return res.json({
        message: 'Application approved. User must set their password using the setup token.',
        application: app,
        setupToken: setupTokenPlain,   // Relay to user via a secure channel (e.g. email)
        setupTokenExpiresAt: expiresAt.toISOString(),
        setupTokenTtlMinutes: ttlMinutes,
      });
    }

    await client.query('COMMIT');
    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: app,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/v1/kvic/users
router.get('/users', requireAuth, requireRole('kvic', 'admin'), async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT actor_id, org_id, name, email, roles, org, region, location, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(
      rows.map((r) => ({
        actorId: r.actor_id,
        orgId: r.org_id,
        name: r.name,
        email: r.email,
        roles: r.roles,
        org: r.org,
        region: r.region,
        location: r.location,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/kvic/organizations
router.get('/organizations', requireAuth, requireRole('kvic', 'admin'), async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM organizations ORDER BY id ASC');
    res.json(
      rows.map((r) => ({
        orgId: r.org_id,
        name: r.name,
        type: r.type,
        region: r.region,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
