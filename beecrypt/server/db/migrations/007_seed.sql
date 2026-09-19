-- Migration 007: Seed Demo Data
-- Password for all demo accounts is: demo123

-- 1. Organizations
INSERT INTO organizations (org_id, name, type, region) VALUES
  ('ORG-101', 'HoneyChain Apiary Network', 'beekeeper', 'Tamil Nadu'),
  ('ORG-202', 'HoneyChain Processing Facility', 'processor', 'Tamil Nadu'),
  ('ORG-303', 'National Quality Testing Laboratory', 'laboratory', 'Chennai'),
  ('ORG-401', 'HoneyChain Retail Center', 'retailer', 'Tamil Nadu'),
  ('ORG-001', 'Khadi & Village Industries Commission (KVIC)', 'kvic', 'New Delhi'),
  ('ORG-501', 'HoneyChain State Cooperative', 'multi', 'Tamil Nadu')
ON CONFLICT (org_id) DO NOTHING;

-- 2. Demo Users
INSERT INTO users (actor_id, org_id, name, email, password_hash, roles, org, region, location, multi_actor_ids) VALUES
  ('BK-001', 'ORG-101', 'Lead Beekeeper', 'beekeeper@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['beekeeper'], 'HoneyChain Apiary Network', 'Tamil Nadu', 'Tamil Nadu, India', NULL),
  ('PR-001', 'ORG-202', 'Processing Supervisor', 'processor@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['processor'], 'HoneyChain Processing Facility', 'Tamil Nadu', 'Tamil Nadu, India', NULL),
  ('LAB-001', 'ORG-303', 'Quality Analyst', 'lab@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['laboratory'], 'National Quality Testing Laboratory', 'Chennai', 'Chennai, India', NULL),
  ('KVIC-001', 'ORG-001', 'KVIC Regulatory Officer', 'admin@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['kvic'], 'Khadi & Village Industries Commission', 'New Delhi', 'New Delhi, India', NULL),
  ('RET-001', 'ORG-401', 'Retail Manager', 'retailer@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['retailer'], 'HoneyChain Retail Center', 'Tamil Nadu', 'Tamil Nadu, India', NULL),
  ('LAB-002', 'ORG-303', 'Quality Verifier', 'verifier@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['laboratory'], 'National Quality Testing Laboratory', 'Chennai', 'Chennai, India', NULL),
  ('ORG-501', 'ORG-501', 'Operations Lead', 'multi@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['beekeeper', 'processor', 'laboratory', 'retailer', 'kvic'], 'HoneyChain State Cooperative', 'Tamil Nadu', 'Tamil Nadu, India', '{"beekeeper": "BK-045", "processor": "PR-045", "laboratory": "LAB-045", "retailer": "RET-001", "kvic": "KVIC-001"}'::jsonb),
  ('BK-045', 'ORG-501', 'Operations Beekeeper', 'arun.beekeeper@beecrypt.demo', '$2a$10$tZyXrb7/rkYlDa2YrrtHW.8aL825hC169JGMLn3FH626uhQaL4H.2', ARRAY['beekeeper'], 'HoneyChain State Cooperative', 'Tamil Nadu', 'Tamil Nadu, India', NULL)
ON CONFLICT (email) DO NOTHING;

-- 3. Hives
INSERT INTO hives (hive_id, producer_id, region, block, status, temp, humidity, vibration, sensor, battery) VALUES
  ('H-1024', 'BK-001', 'Erode', 'Apiary A — Block 03', 'healthy', 34.8, 61, 0.320, 'online', 87),
  ('H-1025', 'BK-001', 'Erode', 'Apiary A — Block 04', 'healthy', 35.1, 58, 0.290, 'online', 92),
  ('H-1026', 'BK-001', 'Erode', 'Apiary B — Block 01', 'warning', 37.6, 68, 0.410, 'online', 74),
  ('H-1030', 'BK-001', 'Erode', 'Apiary B — Block 02', 'critical', 39.2, 82, 0.580, 'online', 21),
  ('H-1032', 'BK-001', 'Erode', 'Apiary A — Block 05', 'healthy', 34.5, 60, 0.310, 'online', 95),
  ('H-2011', 'BK-045', 'Salem', 'Apiary C — Block 01', 'healthy', 34.2, 57, 0.270, 'online', 88)
ON CONFLICT (hive_id) DO NOTHING;

-- 4. Hive Inspections
INSERT INTO inspections (inspection_id, hive_id, producer_id, queen_status, colony_strength, notes, inspected_at) VALUES
  ('INSP-001', 'H-1024', 'BK-001', 'Active & Laying', 'Strong (9 frames)', 'Solid brood pattern, healthy worker activity, zero pest signs.', '2026-09-05T08:30:00Z'),
  ('INSP-002', 'H-1025', 'BK-001', 'Active & Laying', 'Strong (8 frames)', 'Ample honey stores in supers, calm colony temperament.', '2026-09-04T10:15:00Z'),
  ('INSP-003', 'H-1026', 'BK-001', 'Queen Cell Observed', 'Moderate (6 frames)', 'Supersedure cell noticed on frame 4. Monitoring swarm behavior.', '2026-09-03T14:00:00Z'),
  ('INSP-004', 'H-1030', 'BK-001', 'Queen Absent (Urgent)', 'Weak (Under 4 frames)', 'No eggs seen in brood nest. High temperature alert triggered.', '2026-09-02T16:45:00Z')
ON CONFLICT (inspection_id) DO NOTHING;

-- 5. Batches
INSERT INTO batches (batch_id, producer_id, producer_name, hive_id, region, honey_type, floral_source, harvest_date, quantity, processor_id, processing_method, processing_status, lab_id, test_status, certificate_id, cert_status, stage, parent_batch_id) VALUES
  ('BEE-2026-001024', 'BK-001', 'Lead Beekeeper', 'H-1024', 'Tamil Nadu', 'Multifloral', 'Eucalyptus / Wildflower', '2026-09-04', 18.5, 'PR-001', 'Cold Extraction', 'Completed', 'LAB-001', 'PASS', 'AGMARK-2026-001024', 'CERTIFIED', 6, NULL),
  ('BEE-2026-000998', 'BK-001', 'Lead Beekeeper', 'H-1025', 'Tamil Nadu', 'Forest Honey', 'Mixed Forest Bloom', '2026-08-29', 22.0, 'PR-001', NULL, 'In Progress', NULL, 'PENDING', NULL, 'PENDING', 2, NULL),
  ('BEE-2026-000971', 'BK-001', 'Lead Beekeeper', 'H-1032', 'Tamil Nadu', 'Multifloral', 'Coriander / Wildflower', '2026-08-22', 15.2, 'PR-001', 'Cold Extraction', 'Completed', 'LAB-002', 'PENDING', NULL, 'PENDING', 4, NULL)
ON CONFLICT (batch_id) DO NOTHING;

-- 6. Provenance Events
INSERT INTO provenance_events (event_id, batch_id, event_type, actor_id, occurred_at, recorded_at, payload, payload_hash, previous_event_hash, signature, blockchain_tx, blockchain_status) VALUES
  ('EVT-00041', 'BEE-2026-001024', 'HARVESTED', 'BK-001', '2026-09-04T06:30:00Z', '2026-09-04T06:32:00Z', '{"hiveId": "H-1024", "honeyType": "Multifloral"}', 'a6f9c8d3e2b1049581726354abcdeff0123456789abcdef0123456789abcdef0', NULL, NULL, NULL, 'NOT_CONNECTED'),
  ('EVT-00042', 'BEE-2026-001024', 'EXTRACTED', 'BK-001', '2026-09-04T09:00:00Z', '2026-09-04T09:05:00Z', '{"quantity": 18.5, "unit": "L"}', 'b7e8d9c0a1f2e3d4c5b6a7081928374650192837465019283746501928374650', 'a6f9c8d3e2b1049581726354abcdeff0123456789abcdef0123456789abcdef0', NULL, NULL, 'NOT_CONNECTED'),
  ('EVT-00043', 'BEE-2026-001024', 'PROCESSED', 'PR-001', '2026-09-04T14:00:00Z', '2026-09-04T14:10:00Z', '{"processingMethod": "Cold Extraction"}', 'c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7', 'b7e8d9c0a1f2e3d4c5b6a7081928374650192837465019283746501928374650', NULL, NULL, 'NOT_CONNECTED'),
  ('EVT-00044', 'BEE-2026-001024', 'QUALITY_VERIFY', 'LAB-001', '2026-09-05T11:30:00Z', '2026-09-05T11:35:00Z', '{"testId": "TEST-00199", "result": "PASS"}', 'd9c8b7a6e5f4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8', 'c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7', NULL, NULL, 'NOT_CONNECTED'),
  ('EVT-00045', 'BEE-2026-001024', 'CERTIFICATE_ISSUED', 'LAB-001', '2026-09-05T12:00:00Z', '2026-09-05T12:02:00Z', '{"certificateId": "AGMARK-2026-001024"}', 'e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', 'd9c8b7a6e5f4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8', NULL, NULL, 'NOT_CONNECTED')
ON CONFLICT (event_id) DO NOTHING;

-- 7. Test Requests
INSERT INTO test_requests (request_id, batch_id, lab_id, sample_qty_ml, tests, requested_date, notes, status) VALUES
  ('REQ-001', 'BEE-2026-000971', 'LAB-002', 250, ARRAY['Purity', 'Moisture', 'Adulteration'], '2026-08-24', '', 'Pending Laboratory Acceptance')
ON CONFLICT (request_id) DO NOTHING;

-- 8. Quality Results
INSERT INTO quality_results (test_id, batch_id, lab_id, test_date, moisture, sucrose, fructose, glucose, adulteration, test_status, verifier_id) VALUES
  ('TEST-00199', 'BEE-2026-001024', 'LAB-001', '2026-09-05', 17.2, 38.0, 39.0, 34.0, 'Not Detected', 'PASS', 'LAB-001-V1')
ON CONFLICT (test_id) DO NOTHING;

-- 9. Certificates
INSERT INTO certificates (certificate_id, batch_id, lab_id, test_date, issue_date, result, verifier_id, file_name, uploaded) VALUES
  ('AGMARK-2026-001024', 'BEE-2026-001024', 'LAB-001', '2026-09-05', '2026-09-05', 'PASS', 'LAB-001-V1', 'AGMARK-2026-001024.pdf', true)
ON CONFLICT (certificate_id) DO NOTHING;

-- 10. Alerts
INSERT INTO alerts (alert_id, level, hive_id, title, body, read, occurred_at) VALUES
  ('AL-01', 'critical', 'H-1024', 'High Temperature', 'reached 39.2°C. Inspect hive ventilation.', false, NOW() - INTERVAL '2 minutes'),
  ('AL-02', 'warning', 'H-1030', 'Abnormal Humidity', 'humidity reached 82%.', false, NOW() - INTERVAL '10 minutes'),
  ('AL-03', 'warning', 'H-1026', 'Abnormal Vibration', 'unusual vibration pattern detected.', false, NOW() - INTERVAL '20 minutes')
ON CONFLICT (alert_id) DO NOTHING;

-- 11. Notifications
INSERT INTO notifications (user_id, text, read) VALUES
  ('BK-001', 'Hive H-1024 temperature is high.', false),
  ('PR-001', 'New laboratory request received for BEE-2026-000971.', false),
  ('RET-001', 'Certificate issued for BEE-2026-001024.', true),
  ('ORG-501', 'KVIC approved your Processor role.', true);

-- 12. Pending Applications (KVIC)
INSERT INTO pending_applications (name, email, roles, region, docs, status) VALUES
  ('Suresh Pandian', 'suresh.p@example.com', ARRAY['beekeeper', 'processor'], 'Madurai', 3, 'Pending'),
  ('Lakshmi Narayan', 'lakshmi.n@example.com', ARRAY['laboratory'], 'Chennai', 2, 'Pending'),
  ('Karthik Raja', 'karthik.r@example.com', ARRAY['beekeeper'], 'Theni', 3, 'Pending');
