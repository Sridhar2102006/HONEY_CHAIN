# HoneyChain (BeeCrypt) SIH'26 — Master Remediation Log

This engineering log tracks every architectural modification, code edit, database migration, and test result performed during the autonomous remediation and security hardening process.

---

### Phase 1: Database Safety & Destructive Endpoint Elimination
- **HC-001 (Database Wipe Endpoint):**
  - *Action:* Completely removed `router.post('/clean', ...)` from `server/routes/healthRoutes.js` and removed endpoint registration from `server/index.js`.
  - *Hardening:* Added fatal guard in `server/db/clean.js` that checks `process.env.NODE_ENV === 'production'` and throws `[SECURITY FATAL]` immediately before any TRUNCATE command can execute.
  - *Frontend:* Removed backend clean trigger from `resetAllData()` in `src/context/AppContext.jsx`.
  - *Verification:* `tests/security.test.js` tests route exclusion and production abort behavior.
- **HC-002 (Secret Exposure & Rotation):**
  - *Action:* Verified `server/.env` is strictly excluded from git tracking (`git ls-files server/.env` returned empty). Created updated `server/.env.example` with safe placeholder tokens.
  - *Documentation:* Created `docs/SECRET_ROTATION_REQUIRED.md` detailing step-by-step console instructions for rotating Neon PostgreSQL, MongoDB Atlas, and JWT Secret credentials.
- **HC-022 (Database Referential Integrity):**
  - *Action:* Created migration `server/db/migrations/009_add_foreign_keys.sql` adding foreign keys:
    - `batches(producer_id)` -> `users(actor_id)`
    - `batches(processor_id)` -> `users(actor_id)`
    - `batches(lab_id)` -> `users(actor_id)`
    - `inspections(hive_id)` -> `hives(id)`
    - `test_requests(batch_id)` -> `batches(id)`
    - `quality_results(batch_id)` -> `batches(id)`
    - `certificates(batch_id)` -> `batches(id)`
  - *Migration Script:* Hardened `server/db/migrate.js` to strip SQL comments and execute individual statements sequentially to accommodate Neon Serverless HTTP multi-command constraints.
  - *Verification:* Migration `009_add_foreign_keys.sql` applied successfully on live Neon database.

---

### Phase 2: Access Control, State Machine & Business Logic
- **HC-003 & HC-004 (Batch & Hive Creation IDOR):**
  - *Action:* In `server/routes/batchRoutes.js` and `server/routes/hiveRoutes.js`, implemented server-side identity enforcement:
    `const isAdmin = req.user.roles?.some(r => ['kvic', 'admin'].includes(r));`
    `const effectiveProducerId = isAdmin && req.body.producerId ? req.body.producerId : req.user.actorId;`
  - *Protection:* Normal beekeepers can never inject an arbitrary `producerId` or claim another beekeeper's identity.
  - *Verification:* Verified via unit tests in `tests/security.test.js`.
- **HC-005 (Batch State Machine & Mass Conservation):**
  - *Action:* Created `server/services/batchStateMachine.js` enforcing monotonic lifecycle progression (Stage 1 -> 2 -> 3 -> 4 -> 5 -> 6). Prevents stage skipping and regression.
  - *Quantity Protection:* Quantity editing is strictly locked once a batch enters processing (Stage >= 2). For batch splits, enforces `parent_quantity >= sum(child_quantities)` to prevent unauthorized creation of mass.
  - *Verification:* Verified in `tests/remediation.test.js`.
- **HC-006 & HC-024 (Certificate Authorization & Data Integrity):**
  - *Action:* Protected `POST /api/v1/lab/certificates` with `requireRole('laboratory', 'verifier', 'kvic', 'admin')`. Enforced prerequisite that batch must be at Stage 5 and have `test_status === 'PASS'`.
  - *Data Integrity:* Certificate status distinguishes between metadata-only (`isUploaded = false`) and verified document uploaded (`isUploaded = Boolean(fileName && uploaded === true)`).
  - *Verification:* Negative role tests in `tests/security.test.js` prove beekeepers and processors receive HTTP 403.
- **HC-017 (Public Consumer Verification Endpoint):**
  - *Action:* Created `GET /api/v1/events/public` in `server/routes/eventRoutes.js` allowing anonymous consumers to query provenance timelines by batch ID without requiring internal authentication tokens or leaking internal credentials.

---

### Phase 3: IoT, Sensors, Camera & SSRF Protection
- **HC-007 (Sensor Endpoint Authentication & Scoping):**
  - *Action:* Added `requireAuth` and tenant hive ownership verification to `GET /api/v1/sensors/stream`, `GET /api/v1/sensors/latest`, and `GET /api/v1/sensors/history`.
  - *Verification:* `tests/sensor.test.js` asserts unauthenticated requests return 401.
- **HC-030 (MongoDB Time-Series Data Retention):**
  - *Action:* Added 90-day TTL index on `receivedAt` field (`{ expireAfterSeconds: 7776000 }`) on `READINGS` collection in MongoDB Atlas to prevent unbounded disk growth.
- **HC-025, HC-026 & HC-027 (Camera Security, SSRF & Centralized JWT):**
  - *Action:* Implemented `validateAndSanitizeTargetUrl()` in `server/routes/cameraRoutes.js`. Blocks cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`), public internet IPs, and hostnames in production. Requires RFC-1918 private IPv4 subnets.
  - *Centralized JWT:* Removed divergent `process.env.JWT_SECRET` fallback in camera router, importing centralized `JWT_SECRET` from `middleware/auth.js`.
  - *Verification:* Tested in `tests/camera.test.js` (11/11 tests pass) and `tests/security.test.js`.
- **HC-018 & HC-019 (ESP32 Firmware Hardening):**
  - *Action:* In `firmware/ESP32_Telemetry/ESP32_Telemetry.ino`, replaced hardcoded IP `10.131.229.86` with configurable `#ifndef BACKEND_URL` build flags. Added operational modes (`MODE_REALTIME` vs `MODE_BATTERY` with deep sleep), exponential backoff retry, replay protection sequence numbers, sensor range bounds validation, and offline ring buffer (up to 20 samples in RTC memory).

---

### Phase 4: Truthfulness, Frontend Performance & Accessibility
- **HC-008 (Blockchain Truthfulness):**
  - *Action:* Created `ProvenanceProvider` abstraction in `src/services/blockchainService.js` with explicit states:
    - `LOCAL_HASH_CHAIN` (Current implementation: PostgreSQL SHA-256 linked blocks)
    - `BLOCKCHAIN_PENDING` (Anchoring transaction dispatched)
    - `BLOCKCHAIN_CONFIRMED` (Cryptographically verified on-chain receipt)
    - `BLOCKCHAIN_FAILED`
  - *UI Disclosure:* Renamed UI labels from misleading "Blockchain Verified" to "Local Cryptographic Hash Chain (SHA-256 Provenance)".
- **HC-009 (AI Hive Health Truthfulness):**
  - *Action:* Created `src/services/aiHealthProvider.js` separating `SimulationProvider` and `RealVisionProvider`. Labeled AI diagnosis in `AIHiveHealth.jsx` prominently with "PROTOTYPE SIMULATION" badges and labeled confidence score as "Simulation Score".
- **HC-010 (Canonical QR Verification URL):**
  - *Action:* In `src/components/QRCodeCard.jsx`, removed hardcoded NXDOMAIN `https://beecrypt.demo/verify/:batchId` in favor of configurable `VITE_PUBLIC_VERIFY_URL` or dynamic `window.location.origin/verify/:batchId`.
- **HC-013 & HC-014 (Authentic Auth & Server-Side OTP):**
  - *Action:* In `src/services/authService.js`, removed silent fallback to `DEMO_USERS` upon network error. Added cryptographic server-side OTP service (`server/services/otpService.js`) with 6-digit codes, salt hashing, 5-minute expiry, max 3 attempts, and single-use invalidation.
- **HC-021 (Honey Unit Consistency):**
  - *Action:* Standardized all volume/mass measurements across `Processing.jsx`, `BatchCard.jsx`, `Traceability.jsx`, `HoneyExtraction.jsx`, `HiveDetail.jsx`, `QRScannerModal.jsx`, and all role dashboards to kilograms (`kg`).
- **HC-023 (Frontend Bundle Splitting):**
  - *Action:* Configured Rollup `manualChunks` in `vite.config.js`:
    - `vendor-react`: `react`, `react-dom`, `react-router-dom` (164 kB / 53 kB gzip)
    - `vendor-charts`: `recharts` (411 kB / 110 kB gzip)
    - `vendor-icons`: `lucide-react` (30 kB / 5.9 kB gzip)
    - Main `index.js`: decreased from 338 kB to 155 kB (41 kB gzip).
- **HC-029 (Accessibility & WCAG):**
  - *Action:* Added `aria-expanded` and `aria-controls="verification-details-panel"` to accordion toggle buttons in `src/components/BlockchainProofCard.jsx`.

---

### Phase 5: Containerization, CI/CD Quality Gates & Dependency Audits
- **HC-011 (Mobile Network Security Configuration):**
  - *Action:* Added `android/app/src/main/res/xml/network_security_config.xml` enforcing strict HTTPS (`cleartextTrafficPermitted="false"`) by default with debug overrides for local emulators. Linked in `AndroidManifest.xml`.
- **HC-012 & HC-028 (CI/CD Failure Suppression & Static Analysis):**
  - *Action:* Removed `|| echo` failure suppression on line 34 of `.github/workflows/ci.yml`. Added `eslint.config.js` and `tsconfig.json`. Added `npm run lint`, `npm run typecheck`, and `npm run test:ci` scripts to `package.json`.
- **HC-015 (Production Dockerization):**
  - *Action:* Created multi-stage `Dockerfile` (Node 22-alpine, non-root user `nodeuser`, dumb-init, healthcheck) and `docker-compose.yml` deploying isolated local PostgreSQL 16 and MongoDB 7.0 instances.
- **HC-020 (Dependency Vulnerability Remediation):**
  - *Action:* Ran `npm audit fix` in `server/`, eliminating all `qs` moderate vulnerabilities. Backend audit reports 0 vulnerabilities. Frontend dev dependencies documented with zero runtime production impact.

---

### Final Test Execution Summary
- **Total Automated Tests:** 73 passing / 0 failing across 12 test suites.
- **Static Analysis (ESLint):** 0 errors.
- **TypeScript Type Check:** 0 errors.
- **Production Build:** Vite built in 4.41s with 0 warnings.
