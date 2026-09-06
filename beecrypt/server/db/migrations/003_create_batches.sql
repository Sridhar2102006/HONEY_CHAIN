-- Migration 003: Batches and Batch Relationships
CREATE TABLE IF NOT EXISTS batches (
  id                SERIAL PRIMARY KEY,
  batch_id          TEXT UNIQUE NOT NULL,
  producer_id       TEXT NOT NULL,
  producer_name     TEXT,
  hive_id           TEXT REFERENCES hives(hive_id) ON DELETE SET NULL,
  region            TEXT,
  honey_type        TEXT,
  floral_source     TEXT,
  harvest_date      DATE,
  quantity          NUMERIC(10,2),
  processor_id      TEXT,
  processing_method TEXT,
  processing_status TEXT DEFAULT 'Pending',
  lab_id            TEXT,
  test_status       TEXT DEFAULT 'PENDING',
  certificate_id    TEXT,
  cert_status       TEXT DEFAULT 'PENDING',
  stage             INTEGER DEFAULT 1,
  parent_batch_id   TEXT REFERENCES batches(batch_id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_relationships (
  id                  SERIAL PRIMARY KEY,
  parent_batch_id     TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  child_batch_id      TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  relationship_type   TEXT DEFAULT 'SPLIT',
  transformation_date DATE,
  quantity            NUMERIC(10,2),
  reason              TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_batch_id ON batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_producer_id ON batches(producer_id);
CREATE INDEX IF NOT EXISTS idx_batches_stage ON batches(stage);
CREATE INDEX IF NOT EXISTS idx_batch_rel_parent ON batch_relationships(parent_batch_id);
