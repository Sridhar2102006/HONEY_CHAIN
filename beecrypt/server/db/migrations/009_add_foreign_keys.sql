-- Migration 009: Add Referential Integrity Constraints (HC-022)
-- Enforces foreign keys across batches, inspections, lab test requests, quality results, and certificates.

ALTER TABLE batches DROP CONSTRAINT IF EXISTS fk_batches_producer_id;
ALTER TABLE batches ADD CONSTRAINT fk_batches_producer_id FOREIGN KEY (producer_id) REFERENCES users(actor_id) ON DELETE RESTRICT;

ALTER TABLE batches DROP CONSTRAINT IF EXISTS fk_batches_processor_id;
ALTER TABLE batches ADD CONSTRAINT fk_batches_processor_id FOREIGN KEY (processor_id) REFERENCES users(actor_id) ON DELETE SET NULL;

ALTER TABLE batches DROP CONSTRAINT IF EXISTS fk_batches_lab_id;
ALTER TABLE batches ADD CONSTRAINT fk_batches_lab_id FOREIGN KEY (lab_id) REFERENCES users(actor_id) ON DELETE SET NULL;

ALTER TABLE inspections DROP CONSTRAINT IF EXISTS fk_inspections_producer_id;
ALTER TABLE inspections ADD CONSTRAINT fk_inspections_producer_id FOREIGN KEY (producer_id) REFERENCES users(actor_id) ON DELETE CASCADE;

ALTER TABLE test_requests DROP CONSTRAINT IF EXISTS fk_test_requests_lab_id;
ALTER TABLE test_requests ADD CONSTRAINT fk_test_requests_lab_id FOREIGN KEY (lab_id) REFERENCES users(actor_id) ON DELETE RESTRICT;

ALTER TABLE quality_results DROP CONSTRAINT IF EXISTS fk_quality_results_lab_id;
ALTER TABLE quality_results ADD CONSTRAINT fk_quality_results_lab_id FOREIGN KEY (lab_id) REFERENCES users(actor_id) ON DELETE RESTRICT;

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS fk_certificates_lab_id;
ALTER TABLE certificates ADD CONSTRAINT fk_certificates_lab_id FOREIGN KEY (lab_id) REFERENCES users(actor_id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_batches_processor_id ON batches(processor_id);
CREATE INDEX IF NOT EXISTS idx_batches_lab_id ON batches(lab_id);
CREATE INDEX IF NOT EXISTS idx_test_requests_lab_id ON test_requests(lab_id);
CREATE INDEX IF NOT EXISTS idx_quality_results_lab_id ON quality_results(lab_id);
CREATE INDEX IF NOT EXISTS idx_certificates_lab_id ON certificates(lab_id);
