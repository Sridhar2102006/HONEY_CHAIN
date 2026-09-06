-- Migration 006: Lab Testing, Certificates, Alerts, Notifications & KVIC Applications
CREATE TABLE IF NOT EXISTS test_requests (
  id              SERIAL PRIMARY KEY,
  request_id      TEXT UNIQUE NOT NULL,
  batch_id        TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  lab_id          TEXT NOT NULL,
  sample_qty_ml   INTEGER,
  tests           TEXT[],
  requested_date  DATE,
  notes           TEXT,
  status          TEXT DEFAULT 'Pending Laboratory Acceptance',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_results (
  id           SERIAL PRIMARY KEY,
  test_id      TEXT UNIQUE NOT NULL,
  batch_id     TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  lab_id       TEXT NOT NULL,
  test_date    DATE,
  moisture     NUMERIC(5,2),
  sucrose      NUMERIC(5,2),
  fructose     NUMERIC(5,2),
  glucose      NUMERIC(5,2),
  adulteration TEXT,
  test_status  TEXT,
  verifier_id  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id              SERIAL PRIMARY KEY,
  certificate_id  TEXT UNIQUE NOT NULL,
  batch_id        TEXT NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
  lab_id          TEXT NOT NULL,
  test_date       DATE,
  issue_date      DATE DEFAULT CURRENT_DATE,
  result          TEXT,
  verifier_id     TEXT,
  file_name       TEXT,
  file_path       TEXT,
  uploaded        BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id          SERIAL PRIMARY KEY,
  alert_id    TEXT UNIQUE NOT NULL,
  level       TEXT NOT NULL,
  hive_id     TEXT REFERENCES hives(hive_id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  read        BOOLEAN DEFAULT FALSE,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT,
  text        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pending_applications (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  roles       TEXT[] NOT NULL,
  region      TEXT,
  docs        INTEGER DEFAULT 1,
  status      TEXT DEFAULT 'Pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_req_batch ON test_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_test_req_lab ON test_requests(lab_id);
CREATE INDEX IF NOT EXISTS idx_quality_batch ON quality_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_cert_batch ON certificates(batch_id);
