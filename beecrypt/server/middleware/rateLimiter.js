/**
 * rateLimiter.js — Simple in-memory sliding-window rate limiter.
 *
 * No external dependency required. Appropriate for single-instance deployments.
 * For multi-instance/distributed deployments, replace the in-memory store with
 * a shared cache (e.g. Redis via ioredis) using the same interface.
 */

/**
 * @param {object} options
 * @param {number} options.windowMs   - Window duration in ms (default: 15 min)
 * @param {number} options.max        - Max requests per window per IP (default: 10)
 * @param {string} options.message    - Error message when limited
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = 'Too many requests. Please try again later.',
} = {}) {
  const store = new Map();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of store) {
      const fresh = timestamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, fresh);
      }
    }
  }, windowMs);

  if (cleanupInterval.unref) cleanupInterval.unref();

  return function rateLimiterMiddleware(req, res, next) {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const timestamps = (store.get(ip) || []).filter((t) => now - t < windowMs);
    timestamps.push(now);
    store.set(ip, timestamps);

    if (timestamps.length > max) {
      const retryAfterSec = Math.ceil(windowMs / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMITED',
        retryAfterSeconds: retryAfterSec,
      });
    }

    next();
  };
}
