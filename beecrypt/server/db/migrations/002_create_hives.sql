-- Migration 002: Hives
CREATE TABLE IF NOT EXISTS hives (
  id SERIAL PRIMARY KEY,
  hive_id TEXT UNIQUE NOT NULL,
  producer_id TEXT NOT NULL REFERENCES users(actor_id) ON DELETE CASCADE,
  region TEXT,
  block TEXT,
  status TEXT DEFAULT 'healthy',
  temp NUMERIC(5,2),
  humidity INTEGER,
  vibration NUMERIC(5,3),
  sensor TEXT DEFAULT 'online',
  battery INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hives_producer ON hives(producer_id);
CREATE INDEX IF NOT EXISTS idx_hives_hive_id ON hives(hive_id);
