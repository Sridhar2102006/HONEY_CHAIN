-- Migration 008: Password Setup Token for KVIC-Approved Users
-- Adds columns to support one-time password-setup flow instead of hardcoded 'demo123'.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS setup_token          TEXT,
  ADD COLUMN IF NOT EXISTS setup_token_expires  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_setup_token ON users(setup_token)
  WHERE setup_token IS NOT NULL;
