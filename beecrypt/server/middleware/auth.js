import jwt from 'jsonwebtoken';

// ── JWT Secret validation ─────────────────────────────────────────────────────
// The INSECURE_PLACEHOLDER is the value that ships in .env.example.
// If this placeholder or an empty value is used in production, the server
// must refuse to start — a weak secret is worse than no secret.
const INSECURE_PLACEHOLDER = 'beecrypt_super_secret_jwt_key_2026_change_in_production';
const DEV_FALLBACK_SECRET   = 'beecrypt_dev_only_secret_DO_NOT_USE_IN_PRODUCTION';

function resolveJwtSecret() {
  const raw = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!raw || raw.trim() === '' || raw === INSECURE_PLACEHOLDER) {
    if (isProduction) {
      // Hard-fail: never start with a missing or placeholder secret in production.
      throw new Error(
        '[SECURITY] JWT_SECRET is missing or uses the insecure placeholder value. ' +
        'Set a strong, unique JWT_SECRET environment variable before starting in production.'
      );
    }
    // Development/test: warn loudly but allow startup with a dev-only fallback.
    console.warn(
      '\n⚠️  [WARNING] JWT_SECRET is not configured or uses the placeholder value.\n' +
      '    A development-only fallback is being used.\n' +
      '    DO NOT deploy to production without setting a strong JWT_SECRET.\n'
    );
    return DEV_FALLBACK_SECRET;
  }

  return raw;
}

const JWT_SECRET = resolveJwtSecret();
// ─────────────────────────────────────────────────────────────────────────────


export function requireAuth(req, res, next) {
  // 1. Try reading token from HTTP-only cookie
  let token = req.cookies?.token;

  // 2. Fallback to Authorization: Bearer header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions for this action',
        requiredRoles: allowedRoles,
      });
    }
    next();
  };
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
