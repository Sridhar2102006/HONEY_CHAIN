-- Migration 005: Hive Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id              SERIAL PRIMARY KEY,
  inspection_id   TEXT UNIQUE NOT NULL,
  hive_id         TEXT NOT NULL REFERENCES hives(hive_id) ON DELETE CASCADE,
  producer_id     TEXT NOT NULL,
  queen_status    TEXT,
  colony_strength TEXT,
  notes           TEXT,
  inspected_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_hive_id ON inspections(hive_id);
CREATE INDEX IF NOT EXISTS idx_inspections_producer_id ON inspections(producer_id);
