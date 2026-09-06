-- Migration 004: Provenance Events (Blockchain-Ready)
CREATE TABLE IF NOT EXISTS provenance_events (
  id                  SERIAL PRIMARY KEY,
  event_id            TEXT UNIQUE NOT NULL,
  batch_id            TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  event_type          TEXT NOT NULL,
  actor_id            TEXT NOT NULL,
  occurred_at         TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ DEFAULT NOW(),
  payload             JSONB DEFAULT '{}',
  payload_hash        TEXT,
  previous_event_hash TEXT,
  signature           TEXT,
  blockchain_tx       TEXT,
  blockchain_status   TEXT DEFAULT 'NOT_CONNECTED'
);

CREATE INDEX IF NOT EXISTS idx_events_batch_id ON provenance_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON provenance_events(occurred_at);
