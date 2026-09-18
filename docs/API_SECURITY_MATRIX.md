# HoneyChain API Endpoint Security & Authorization Matrix

This matrix specifies the security posture, authentication requirements, role authorization, and input validation requirements for every endpoint exposed by the backend API.

| HTTP Method | Route Endpoint | Authentication | Role Authorization | Scope & Ownership Check | Validation Rules | Risk Rating |
|:---:|---|:---:|:---:|---|---|:---:|
| **GET** | `/api/v1/health` | Public | None | None (System Health) | Read-only database ping | Low |
| **POST** | `/api/v1/auth/login` | Public | None | Rate limited (10/15 min) | Email and password required | High |
| **POST** | `/api/v1/auth/logout` | Public | None | Clears token cookie | None | Low |
| **GET** | `/api/v1/auth/me` | Required | Any Authenticated | Resolves `req.user.actorId` | Valid Bearer token | Low |
| **POST** | `/api/v1/auth/register` | Public | None | Inserts into pending applications | Name, email, roles array | Medium |
| **POST** | `/api/v1/auth/setup-password` | Public | None | Validates SHA-256 setup token | Token, email, new password >= 8 chars | High |
| **GET** | `/api/v1/hives` | Required | Beekeeper, KVIC, Admin | Filtered by caller's `actorId` | Query params sanitized | Medium |
| **GET** | `/api/v1/hives/:hiveId` | Required | Beekeeper, KVIC, Admin | Must be owner or KVIC/Admin | Hive ID exists | Medium |
| **POST** | `/api/v1/hives` | Required | Beekeeper, KVIC, Admin | `producerId` locked to `actorId` | Hive ID required; status sanitized | High |
| **GET** | `/api/v1/batches` | Required | Any Authenticated | Filtered by actorId / role | Query filters sanitized | Medium |
| **GET** | `/api/v1/batches/:batchId` | Required | Any Authenticated | Batch record access | Batch ID exists | Medium |
| **POST** | `/api/v1/batches` | Required | Beekeeper, KVIC, Admin | `producerId` locked to `actorId` | Positive quantity; stage defaults to 1 | High |
| **PATCH** | `/api/v1/batches/:batchId` | Required | Producer, Processor, KVIC | Validated against state machine | Monotonic stage; quantity locked | High |
| **POST** | `/api/v1/batches/:batchId/split` | Required | Assigned Processor, KVIC | Child quantities sum <= parent | Array of splits; non-negative values | High |
| **GET** | `/api/v1/events` | Required | Any Authenticated | Internal audit trail | `batchId` query param | Medium |
| **GET** | `/api/v1/events/public` | Public | None | Public read-only QR verification | `batchId` required; sanitized output | Low |
| **POST** | `/api/v1/events` | Required | Any Authenticated | Linked to caller's `actorId` | Computes SHA-256 hash chaining | High |
| **GET** | `/api/v1/lab/test-requests` | Required | Processor, Lab, KVIC | Scoped to assigned lab or processor | Lab ID query param | Medium |
| **POST** | `/api/v1/lab/test-requests` | Required | Processor, KVIC, Admin | Batch must be in Stage 3 | Batch exists; tests array | High |
| **GET** | `/api/v1/lab/quality-results` | Required | Lab, Processor, KVIC | Batch quality metrics | Batch ID exists | Medium |
| **POST** | `/api/v1/lab/quality-results` | Required | Laboratory, Verifier, KVIC | Batch must be in Stage 4 | Moisture, sugars, status PASS/FAIL | High |
| **GET** | `/api/v1/lab/certificates` | Required | Any Authenticated | Certificate metadata query | Batch ID exists | Medium |
| **POST** | `/api/v1/lab/certificates` | Required | Laboratory, Verifier, KVIC | Batch must be in Stage 5 (PASS) | Batch in Stage 5; testStatus PASS | High |
| **GET** | `/api/v1/sensors/stream` | Required | Beekeeper, KVIC, Admin | Requested hive owned by caller | Active SSE subscriber handle | High |
| **GET** | `/api/v1/sensors/latest` | Required | Beekeeper, KVIC, Admin | Requested hive owned by caller | Hive ID query param | Medium |
| **GET** | `/api/v1/sensors/history` | Required | Beekeeper, KVIC, Admin | Requested hive owned by caller | Hive ID query param; limit <= 100 | Medium |
| **POST** | `/api/v1/sensors/telemetry` | Device Key | Sensor Hardware | Hardware device key validated | Physical ranges: temp (-20..80), hum (0..100) | High |
| **GET** | `/api/v1/camera/status` | Required | Beekeeper, KVIC, Admin | Probes configured ESP32 device | 3000ms timeout | Medium |
| **POST** | `/api/v1/camera/capture` | Required | Beekeeper, KVIC, Admin | Hive must belong to caller | Anti-concurrency lock; JPEG verification | High |
| **GET** | `/api/v1/camera/captures/:captureId/image` | Required | Hive Owner, KVIC, Admin | Capture hive owned by caller | Streams from GridFS | High |
| **GET** | `/api/v1/camera/captures` | Required | Beekeeper, KVIC, Admin | Filtered by caller's hives | Limit <= 50 | Medium |
| **GET** | `/api/v1/kvic/applications` | Required | KVIC, Admin | System-wide applications | Admin only | High |
| **PATCH** | `/api/v1/kvic/applications/:id` | Required | KVIC, Admin | Approve/Reject application | Generates 32-byte setup token on approval | High |
