/**
 * otpService.js
 * Cryptographically secure server-side One-Time Password (OTP) management.
 * Enforces rate limiting, attempt limits, expiration, purpose-binding, and one-time invalidation.
 */
import crypto from 'crypto';

// In-memory OTP storage map: key = `${email.toLowerCase()}:${purpose}`
// Value = { hashedOtp, expiresAt, attempts, maxAttempts, createdAt }
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

function hashOtp(otp, salt) {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

/**
 * Generate a new cryptographically random 6-digit OTP for a specific email and purpose.
 */
export function generateOtp(email, purpose = 'VERIFY_EMAIL') {
  if (!email || typeof email !== 'string') {
    throw new Error('Valid email address is required for OTP generation');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const key = `${normalizedEmail}:${purpose}`;

  // Generate cryptographically random 6-digit number between 100000 and 999999
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedOtp = hashOtp(rawOtp, salt);

  const record = {
    hashedOtp,
    salt,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: Date.now(),
  };

  otpStore.set(key, record);

  // Return raw OTP for delivery mechanism (SMS/email provider). Never log raw OTP.
  return {
    rawOtp,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
  };
}

/**
 * Verify a supplied 6-digit OTP against stored record.
 */
export function verifyOtp(email, candidateOtp, purpose = 'VERIFY_EMAIL') {
  if (!email || !candidateOtp) {
    return { verified: false, error: 'Email and verification code are required' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const key = `${normalizedEmail}:${purpose}`;
  const record = otpStore.get(key);

  if (!record) {
    return { verified: false, error: 'No verification code was requested or code has expired' };
  }

  // Check expiration
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { verified: false, error: 'Verification code has expired. Please request a new one.' };
  }

  // Check attempt limit
  record.attempts += 1;
  if (record.attempts > record.maxAttempts) {
    otpStore.delete(key);
    return { verified: false, error: 'Maximum verification attempts exceeded. Please request a new code.' };
  }

  // Validate constant-time hash comparison
  const candidateHash = hashOtp(candidateOtp.trim(), record.salt);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(candidateHash, 'hex'),
    Buffer.from(record.hashedOtp, 'hex')
  );

  if (!isMatch) {
    const remaining = record.maxAttempts - record.attempts;
    return {
      verified: false,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // One-time use: invalidate immediately upon successful verification
  otpStore.delete(key);

  return { verified: true, message: 'Verification successful' };
}

/**
 * Clean up expired OTPs periodically
 */
export function cleanExpiredOtps() {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}
