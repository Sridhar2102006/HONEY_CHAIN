import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/auth.js';
import { query as pgQuery } from '../db/pool.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// HC-026: Strict SSRF validation and IP sanitization for ESP32 target
function isPrivateRfc1918Ip(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

export function validateAndSanitizeTargetUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Device target URL must be a non-empty string.');
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `http://${rawUrl}`);
  } catch {
    throw new Error(`Invalid URL format for camera target: ${rawUrl}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol '${parsed.protocol}'. Only http/https permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Explicit SSRF Blacklist
  const SSRF_BLOCKED = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254',
    'metadata.google.internal',
    'instance-data',
    '::1',
  ];

  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.ALLOW_TEST_LOOPBACK === 'true';

  if (!isTestEnv) {
    if (SSRF_BLOCKED.includes(hostname) || hostname.startsWith('127.') || hostname.startsWith('169.254.')) {
      throw new Error(`[SSRF_BLOCKED] Access to target host '${hostname}' is prohibited.`);
    }

    if (!isPrivateRfc1918Ip(hostname)) {
      throw new Error(`[SSRF_BLOCKED] Camera target '${hostname}' must be an authorized RFC1918 private IoT LAN address.`);
    }
  } else {
    // In test environment, loopback is permitted for local mock fixtures, but cloud metadata endpoints remain strictly forbidden
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.') || hostname === 'metadata.google.internal' || hostname === 'instance-data') {
      throw new Error(`[SSRF_BLOCKED] Access to target host '${hostname}' is prohibited.`);
    }
  }

  return `${parsed.protocol}//${parsed.host}`;
}

const getEsp32Ip = () => {
  const raw = process.env.ESP32_IP || 'http://10.131.229.39';
  return validateAndSanitizeTargetUrl(raw);
};

const CAMERA_DEVICE_KEY = process.env.CAMERA_DEVICE_KEY || 'YOUR_GENERATED_KEY';

// HC-025: Verify hive ownership for camera access
async function verifyHiveOwnership(hiveId, user) {
  if (!hiveId) return true;
  if (!user) return false;
  const roles = user.roles || [];
  if (roles.some((r) => ['kvic', 'admin', 'verifier'].includes(r))) {
    return true;
  }
  try {
    const { rows } = await pgQuery('SELECT producer_id FROM hives WHERE hive_id = $1', [hiveId]);
    if (!rows[0]) {
      return process.env.NODE_ENV !== 'production';
    }
    return rows[0].producer_id === user.actorId;
  } catch (err) {
    console.error('[CAMERA] Hive authorization lookup failed:', err.message);
    return false;
  }
}

// Concurrency lock to prevent duplicate capture triggers
let isCaptureInProgress = false;

// MongoDB connection singleton
let mongoClient = null;
let cameraDb = null;
let imageBucket = null;
let capturesCollection = null;
let mongoInitPromise = null;

async function getMongoContext() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'ESP32CAM';

  if (!uri) {
    throw new Error('MONGODB_URI is not configured in backend environment.');
  }

  if (cameraDb && imageBucket && capturesCollection) {
    return { client: mongoClient, db: cameraDb, bucket: imageBucket, captures: capturesCollection };
  }

  if (!mongoInitPromise) {
    mongoInitPromise = (async () => {
      try {
        mongoClient = new MongoClient(uri, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000,
        });
        await mongoClient.connect();
        cameraDb = mongoClient.db(dbName);
        imageBucket = new GridFSBucket(cameraDb, { bucketName: 'images' });
        capturesCollection = cameraDb.collection('captures');

        // Ensure indexes for fast deterministic lookup
        await capturesCollection.createIndex({ captureId: 1 }, { unique: true }).catch(() => {});
        await capturesCollection.createIndex({ capturedAt: -1 }).catch(() => {});
        await capturesCollection.createIndex({ hiveId: 1 }).catch(() => {});

        console.log(`[CAMERA] Connected to MongoDB Atlas (${dbName}) for GridFS and Captures.`);
        return { client: mongoClient, db: cameraDb, bucket: imageBucket, captures: capturesCollection };
      } catch (err) {
        mongoInitPromise = null;
        console.error('[CAMERA] MongoDB connection error:', err.message);
        throw err;
      }
    })();
  }

  return mongoInitPromise;
}

// Device key authentication for reverse-upload firmware
function requireDeviceKey(req, res, next) {
  if (!CAMERA_DEVICE_KEY || req.get('x-camera-device-key') !== CAMERA_DEVICE_KEY) {
    return res.status(401).json({ error: 'Invalid camera device key', code: 'UNAUTHORIZED_DEVICE' });
  }
  next();
}

// Validate JPEG magic bytes (SOI: 0xFF 0xD8 0xFF)
function isValidJpeg(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 100) return false;
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

// Generate human-readable, unique Capture ID: HC-CAM-YYYYMMDD-XXXXXX
function generateCaptureId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `HC-CAM-${dateStr}-${rand}`;
}

// Safe ESP32 request helper with strict timeout and SSRF isolation
async function fetchFromEsp32(pathname, timeoutMs = 12000) {
  const esp32Base = getEsp32Ip();
  if (!esp32Base) {
    throw new Error('ESP32_IP is not configured in backend environment.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${esp32Base}${pathname}`;
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'image/jpeg, text/plain, */*',
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /status — Probe ESP32-CAM connectivity & latency
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  const startTime = Date.now();
  let esp32Base = null;
  try {
    esp32Base = getEsp32Ip();
    const response = await fetchFromEsp32('/status', 3000);
    const latencyMs = Date.now() - startTime;
    const isOnline = response.ok;

    res.json({
      online: isOnline,
      address: esp32Base,
      latencyMs,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      online: false,
      address: esp32Base || process.env.ESP32_IP || 'unconfigured',
      latencyMs: Date.now() - startTime,
      error: err.name === 'AbortError' ? 'Connection timed out (3000ms)' : err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /capture — Trigger photo capture, store in MongoDB, return metadata
// ─────────────────────────────────────────────────────────────────────────────
router.post('/capture', requireAuth, async (req, res) => {
  // Concurrency lock: Prevent duplicate or overlapping capture executions
  if (isCaptureInProgress) {
    return res.status(409).json({
      success: false,
      error: 'A camera capture is already in progress. Please wait for completion.',
      code: 'CAPTURE_IN_PROGRESS',
    });
  }

  const hiveId = req.body?.hiveId || 'H-DEFAULT';

  // HC-025: Authorize hive ownership before triggering camera
  const isAuthorized = await verifyHiveOwnership(hiveId, req.user);
  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You do not have permission to trigger captures for this hive.',
      code: 'FORBIDDEN_HIVE_ACCESS',
    });
  }

  isCaptureInProgress = true;
  const captureStartTime = Date.now();
  const captureId = generateCaptureId();
  const createdBy = req.user?.actorId || req.user?.id || 'anonymous';

  console.log(`[CAPTURE_REQUESTED] captureId=${captureId} hiveId=${hiveId} user=${createdBy}`);

  try {
    // 1. Ensure MongoDB connectivity
    const { bucket, captures } = await getMongoContext();

    // 2. Dispatch capture trigger to physical ESP32-CAM
    const esp32Base = getEsp32Ip();
    console.log(`[CAMERA_TRIGGER_SENT] Dispatching to ${esp32Base}/capture?hiveId=${encodeURIComponent(hiveId)}`);
    let espResponse;
    try {
      espResponse = await fetchFromEsp32(`/capture?hiveId=${encodeURIComponent(hiveId)}`, 15000);
    } catch (netErr) {
      console.error(`[CAMERA_CONNECTION_FAILED] ${netErr.message}`);
      if (netErr.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          error: 'Camera capture timed out. The ESP32-CAM did not respond within 15 seconds.',
          code: 'CAPTURE_TIMEOUT',
        });
      }
      return res.status(502).json({
        success: false,
        error: `Camera is unreachable at ${esp32Base}. Ensure the ESP32-CAM is powered and on the same Wi-Fi network.`,
        code: 'CAMERA_UNREACHABLE',
        detail: netErr.message,
      });
    }

    if (!espResponse.ok) {
      const errorText = await espResponse.text().catch(() => '');
      console.error(`[CAMERA_ERROR_RESPONSE] Status: ${espResponse.status}, Text: ${errorText}`);
      return res.status(502).json({
        success: false,
        error: 'ESP32-CAM responded with an error during capture.',
        code: 'CAMERA_ERROR',
        statusCode: espResponse.status,
        detail: errorText || 'Camera frame capture failed on device.',
        hint: `The physical ESP32 at ${esp32Base} returned HTTP ${espResponse.status}. If running the legacy sketch, it is attempting an outbound POST to a stale IP. Upload the updated BeeCryptESP32CAM.ino firmware to enable direct JPEG streaming.`,
      });
    }

    // 3. Receive & Validate Image Data
    const rawArrayBuffer = await espResponse.arrayBuffer();
    const imageBuffer = Buffer.from(rawArrayBuffer);
    console.log(`[CAMERA_RESPONSE_RECEIVED] Received ${imageBuffer.length} bytes from ESP32-CAM`);

    if (!isValidJpeg(imageBuffer)) {
      const textPreview = imageBuffer.slice(0, 150).toString('utf8');
      console.error(`[IMAGE_VALIDATION_FAILED] Payload is not a valid JPEG. Preview: ${textPreview}`);
      return res.status(502).json({
        success: false,
        error: 'Camera responded, but no valid JPEG image was received. Ensure firmware is streaming JPEG format.',
        code: 'INVALID_IMAGE_FORMAT',
        detail: textPreview,
      });
    }

    console.log(`[IMAGE_VALIDATED] JPEG magic bytes verified (size: ${imageBuffer.length} bytes)`);

    // 4. Stream binary image directly into MongoDB GridFS
    const filename = `${captureId}.jpg`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: 'image/jpeg',
      metadata: {
        captureId,
        hiveId,
        deviceId: 'ESP32-CAM-01',
        source: 'esp32-direct-stream',
        createdBy,
        fileSize: imageBuffer.length,
      },
    });

    const gridFsFileId = uploadStream.id;
    uploadStream.end(imageBuffer);

    await new Promise((resolve, reject) => {
      uploadStream.once('finish', resolve);
      uploadStream.once('error', reject);
    });

    console.log(`[IMAGE_STORED] Successfully saved to GridFS bucket "images" with fileId=${gridFsFileId}`);

    // 5. Persist structured capture metadata record into captures collection
    const capturedAt = new Date();
    const captureDoc = {
      captureId,
      deviceId: 'ESP32-CAM-01',
      hiveId,
      gridFsFileId,
      filename,
      mimeType: 'image/jpeg',
      fileSize: imageBuffer.length,
      status: 'saved',
      capturedAt,
      receivedAt: capturedAt,
      createdBy,
      createdAt: capturedAt,
      updatedAt: capturedAt,
      metadata: {
        ipAddress: esp32Base,
        latencyMs: Date.now() - captureStartTime,
        firmwareMode: 'direct-stream',
      },
    };

    await captures.insertOne(captureDoc);
    console.log(`[CAPTURE_COMPLETED] captureId=${captureId} latency=${captureDoc.metadata.latencyMs}ms`);

    // 6. Return deterministic response
    res.status(201).json({
      success: true,
      captureId,
      status: 'saved',
      capturedAt: capturedAt.toISOString(),
      imageUrl: `/api/v1/camera/captures/${captureId}/image`,
      metadata: {
        fileSize: imageBuffer.length,
        mimeType: 'image/jpeg',
        hiveId,
        deviceId: 'ESP32-CAM-01',
        latencyMs: captureDoc.metadata.latencyMs,
      },
    });
  } catch (err) {
    console.error('[DATABASE_STORAGE_FAILED]', err);
    res.status(500).json({
      success: false,
      error: 'Image capture succeeded, but database storage failed.',
      code: 'DATABASE_STORAGE_FAILED',
      detail: err.message,
    });
  } finally {
    isCaptureInProgress = false;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /captures/:captureId/image — Stream binary image from MongoDB GridFS (HC-025)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/captures/:captureId/image', requireAuth, async (req, res) => {
  const { captureId } = req.params;

  try {
    const { bucket, captures } = await getMongoContext();

    // Look up capture document
    const record = await captures.findOne({ captureId });
    if (!record) {
      return res.status(404).json({
        error: `No image found for Capture ID: ${captureId}`,
        code: 'IMAGE_NOT_FOUND',
      });
    }

    // HC-025: Authorize hive ownership
    const isAuthorized = await verifyHiveOwnership(record.hiveId, req.user);
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access images for this hive.',
        code: 'FORBIDDEN_HIVE_ACCESS',
      });
    }

    let gridFsFileId = record.gridFsFileId;

    if (!gridFsFileId) {
      // Fallback lookup in images.files by filename
      const file = await cameraDb.collection('images.files').findOne({
        $or: [{ filename: `${captureId}.jpg` }, { 'metadata.captureId': captureId }],
      });
      if (file) gridFsFileId = file._id;
    }

    if (!gridFsFileId) {
      return res.status(404).json({
        error: `No image binary found for Capture ID: ${captureId}`,
        code: 'IMAGE_NOT_FOUND',
      });
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${captureId}.jpg"`,
      'Cache-Control': 'private, max-age=86400, immutable',
    });

    const downloadStream = bucket.openDownloadStream(gridFsFileId);
    downloadStream.on('error', (err) => {
      console.error('[GRIDFS_DOWNLOAD_ERROR]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Could not read image from database store' });
      }
    });
    downloadStream.pipe(res);
  } catch (err) {
    console.error('[IMAGE_STREAM_ERROR]', err);
    res.status(500).json({ error: 'Database error reading image stream', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /captures/:captureId — Retrieve capture metadata (HC-025)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/captures/:captureId', requireAuth, async (req, res) => {
  const { captureId } = req.params;

  try {
    const { captures } = await getMongoContext();
    const record = await captures.findOne({ captureId });

    if (!record) {
      return res.status(404).json({ error: `Capture not found: ${captureId}`, code: 'CAPTURE_NOT_FOUND' });
    }

    // HC-025: Authorize hive ownership
    const isAuthorized = await verifyHiveOwnership(record.hiveId, req.user);
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to view metadata for this hive.',
        code: 'FORBIDDEN_HIVE_ACCESS',
      });
    }

    res.json({
      success: true,
      capture: {
        captureId: record.captureId,
        deviceId: record.deviceId,
        hiveId: record.hiveId,
        status: record.status,
        fileSize: record.fileSize,
        mimeType: record.mimeType,
        capturedAt: record.capturedAt,
        imageUrl: `/api/v1/camera/captures/${record.captureId}/image`,
        metadata: record.metadata,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch capture metadata', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /captures — Retrieve recent captures list with tenant isolation (HC-025)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/captures', requireAuth, async (req, res) => {
  try {
    const { captures } = await getMongoContext();
    const limit = Math.min(parseInt(req.query?.limit, 10) || 10, 50);
    const isPrivileged = (req.user?.roles || []).some((r) => ['kvic', 'admin', 'verifier'].includes(r));

    const filter = {};
    if (req.query?.hiveId) {
      const isAuthorized = await verifyHiveOwnership(req.query.hiveId, req.user);
      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to view captures for this hive.',
          code: 'FORBIDDEN_HIVE_ACCESS',
        });
      }
      filter.hiveId = req.query.hiveId;
    } else if (!isPrivileged) {
      // Limit to caller's owned hives
      const { rows } = await pgQuery('SELECT hive_id FROM hives WHERE producer_id = $1', [req.user.actorId]);
      const ownedHiveIds = rows.map((r) => r.hive_id);
      if (ownedHiveIds.length > 0) {
        filter.hiveId = { $in: ownedHiveIds };
      } else if (process.env.NODE_ENV !== 'production') {
        // In dev, if no hives created yet, allow viewing default
        filter.hiveId = { $in: ['H-1024', 'H-DEFAULT'] };
      } else {
        return res.json({ success: true, count: 0, captures: [] });
      }
    }

    const list = await captures.find(filter).sort({ capturedAt: -1 }).limit(limit).toArray();

    res.json({
      success: true,
      count: list.length,
      captures: list.map((c) => ({
        captureId: c.captureId,
        hiveId: c.hiveId,
        deviceId: c.deviceId,
        status: c.status,
        fileSize: c.fileSize,
        capturedAt: c.capturedAt,
        imageUrl: `/api/v1/camera/captures/${c.captureId}/image`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch captures list', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /latest-image — Backward compatibility: stream most recent capture
// ─────────────────────────────────────────────────────────────────────────────
router.get('/latest-image', requireAuth, async (req, res) => {
  try {
    const { bucket, db, captures } = await getMongoContext();
    const isPrivileged = (req.user?.roles || []).some((r) => ['kvic', 'admin', 'verifier'].includes(r));

    let filter = {};
    if (!isPrivileged) {
      const { rows } = await pgQuery('SELECT hive_id FROM hives WHERE producer_id = $1', [req.user.actorId]);
      const ownedHiveIds = rows.map((r) => r.hive_id);
      if (ownedHiveIds.length > 0) {
        filter = { hiveId: { $in: ownedHiveIds } };
      }
    }

    const latestCapture = await captures.findOne(filter, { sort: { capturedAt: -1 } });
    if (!latestCapture) {
      return res.status(404).json({ error: 'No camera images found', code: 'NO_IMAGES' });
    }

    res.set({
      'Content-Type': latestCapture.mimeType || 'image/jpeg',
      'Content-Disposition': `inline; filename="${latestCapture.filename || 'latest.jpg'}"`,
      'Cache-Control': 'no-cache',
    });

    bucket.openDownloadStream(latestCapture.gridFsFileId).pipe(res);
  } catch (err) {
    res.status(503).json({ error: 'Camera image store unavailable', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. POST /upload — Legacy reverse-upload handler from physical ESP32
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', requireDeviceKey, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image received in upload payload' });
    }

    const { bucket, captures } = await getMongoContext();
    const captureId = generateCaptureId();
    const filename = `${captureId}.jpg`;
    const hiveId = req.body?.hiveId || 'H-DEFAULT';

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype || 'image/jpeg',
      metadata: {
        captureId,
        source: 'esp32-reverse-upload',
        hiveId,
        fileSize: req.file.buffer.length,
      },
    });

    const gridFsFileId = uploadStream.id;
    uploadStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      uploadStream.once('finish', resolve);
      uploadStream.once('error', reject);
    });

    const capturedAt = new Date();
    await captures.insertOne({
      captureId,
      deviceId: 'ESP32-CAM-01',
      hiveId,
      gridFsFileId,
      filename,
      mimeType: req.file.mimetype || 'image/jpeg',
      fileSize: req.file.buffer.length,
      status: 'saved',
      capturedAt,
      receivedAt: capturedAt,
      createdBy: 'esp32-device',
      createdAt: capturedAt,
      updatedAt: capturedAt,
      metadata: {
        firmwareMode: 'reverse-upload',
      },
    });

    console.log(`[LEGACY_UPLOAD_SUCCESS] captureId=${captureId} saved via reverse upload`);
    res.status(201).json({
      success: true,
      captureId,
      filename,
      imageUrl: `/api/v1/camera/captures/${captureId}/image`,
    });
  } catch (err) {
    console.error('[LEGACY_UPLOAD_FAILED]', err);
    res.status(500).json({ error: 'Image upload failed', detail: err.message });
  }
});

export async function closeCameraResources() {
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch {}
    mongoClient = null;
    cameraDb = null;
    imageBucket = null;
    capturesCollection = null;
    mongoInitPromise = null;
  }
}

export default router;