import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { generateOtp, verifyOtp } from '../services/otpService.js';

const router = Router();

// Rate limiter: 10 login attempts per 15-minute window per IP
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this address. Please try again in 15 minutes.',
});

// POST /api/v1/auth/login
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      actorId: user.actor_id,
      orgId: user.org_id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      org: user.org,
      region: user.region,
      location: user.location,
      multiActorIds: user.multi_actor_ids,
    };

    const token = generateToken(payload);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Authentication successful',
      token,
      user: payload,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE actor_id = $1', [req.user.actorId]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    res.json({
      user: {
        actorId: user.actor_id,
        orgId: user.org_id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        org: user.org,
        region: user.region,
        location: user.location,
        multiActorIds: user.multi_actor_ids,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, roles, region, docs } = req.body;
    if (!name || !email || !roles || !roles.length) {
      return res.status(400).json({ error: 'Name, email, and at least one role are required' });
    }

    const { rows } = await query(
      `INSERT INTO pending_applications (name, email, roles, region, docs, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending')
       RETURNING *`,
      [name, email, roles, region || null, docs || 1]
    );

    res.status(201).json({
      message: 'Registration application submitted to KVIC for approval',
      application: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/setup-password
// Redeem a one-time KVIC setup token and set a real password.
router.post('/setup-password', async (req, res, next) => {
  try {
    const { email, setupToken, newPassword } = req.body;

    if (!email || !setupToken || !newPassword) {
      return res.status(400).json({ error: 'email, setupToken, and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash the incoming token to compare against the stored hash
    const tokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');

    const { rows } = await query(
      `SELECT * FROM users
       WHERE LOWER(email) = LOWER($1)
         AND setup_token = $2
         AND setup_token_expires > NOW()
         AND must_change_password = TRUE`,
      [email, tokenHash]
    );

    if (!rows[0]) {
      // Intentionally generic — do not reveal whether account/token/expiry is the issue
      return res.status(400).json({ error: 'Invalid or expired setup token' });
    }

    const user = rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await query(
      `UPDATE users SET
         password_hash        = $1,
         setup_token          = NULL,
         setup_token_expires  = NULL,
         must_change_password = FALSE
       WHERE actor_id = $2`,
      [passwordHash, user.actor_id]
    );

    // Issue JWT so user is immediately authenticated
    const payload = {
      actorId: user.actor_id,
      orgId: user.org_id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      org: user.org,
      region: user.region,
      location: user.location,
      multiActorIds: user.multi_actor_ids,
    };
    const token = generateToken(payload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Password set successfully. You are now signed in.',
      token,
      user: payload,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/request-otp (HC-014: Cryptographic server-backed OTP dispatch)
router.post('/request-otp', async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const { expiresInSeconds } = generateOtp(email, purpose || 'VERIFY_EMAIL');
    res.json({
      success: true,
      message: 'A 6-digit verification code has been dispatched.',
      expiresInSeconds,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/verify-otp (HC-014: Server-side OTP validation)
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required' });
    }
    const result = verifyOtp(email, otp, purpose || 'VERIFY_EMAIL');
    if (!result.verified) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
