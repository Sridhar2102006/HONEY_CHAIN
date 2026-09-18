import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { requireAuth } from '../middleware/auth.js';
import { query as pgQuery } from '../db/pool.js';

const router = Router();

// In-memory active SSE clients
const sseClients = new Set();

// Shared MongoDB connection
let mongoClient = null;
let sensorDb = null;
let sensorReadingsCollection = null;
let mongoInitPromise = null;

async function getMongoContext() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'ESP32CAM';

  if (!uri) {
    throw new Error('MONGODB_URI is not configured in backend environment.');
  }

  if (sensorDb && sensorReadingsCollection) {
    return { client: mongoClient, db: sensorDb, readings: sensorReadingsCollection };
  }

  if (!mongoInitPromise) {
    mongoInitPromise = (async () => {
      try {
        mongoClient = new MongoClient(uri, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000,
        });
        await mongoClient.connect();
        sensorDb = mongoClient.db(dbName);
        const collectionName = process.env.MONGODB_SENSOR_COLLECTION || 'READINGS';
        sensorReadingsCollection = sensorDb.collection(collectionName);

        // Ensure compound indexes for fast time-series queries
        await sensorReadingsCollection.createIndex({ deviceId: 1, receivedAt: -1 }).catch(() => {});
        await sensorReadingsCollection.createIndex({ hiveId: 1, receivedAt: -1 }).catch(() => {});
        await sensorReadingsCollection.createIndex({ receivedAt: -1 }).catch(() => {});
        // HC-030: TTL index - automatically expire raw telemetry older than 90 days
        await sensorReadingsCollection.createIndex(
          { receivedAt: 1 },
          { expireAfterSeconds: 90 * 24 * 60 * 60 }
        ).catch(() => {});

        console.log(`[SENSORS] Connected to MongoDB Atlas (${dbName}) collection '${collectionName}'.`);
        return { client: mongoClient, db: sensorDb, readings: sensorReadingsCollection };
      } catch (err) {
        mongoInitPromise = null;
        console.error('[SENSORS] MongoDB connection error:', err.message);
        throw err;
      }
    })();
  }

  return mongoInitPromise;
}

// HC-007: Verify hive authorization to prevent cross-tenant telemetry access
async function verifyHiveAuthorization(hiveId, user) {
  if (!hiveId) return true;
  if (!user) return false;
  const roles = user.roles || [];
  if (roles.some((r) => ['kvic', 'admin', 'verifier'].includes(r))) {
    return true;
  }
  try {
    const { rows } = await pgQuery('SELECT producer_id FROM hives WHERE hive_id = $1', [hiveId]);
    if (!rows[0]) {
      // Allow during development/prototype if hive record not yet in relational DB
      return process.env.NODE_ENV !== 'production';
    }
    return rows[0].producer_id === user.actorId;
  } catch (err) {
    console.error('[SENSORS] Hive authorization lookup failed:', err.message);
    return false;
  }
}

// Device key authentication middleware
function authenticateSensorDevice(req, res, next) {
  const configuredKey = process.env.SENSOR_DEVICE_KEY || 'beecrypt_sensor_secret_key_2026';
  const providedKey = req.get('x-sensor-device-key') || req.body?.deviceKey;

  // Allow local prototype development if no key configured or key matches
  if (configuredKey && configuredKey !== 'replace_with_sensor_device_key') {
    if (!providedKey || providedKey !== configuredKey) {
      console.warn(`[SENSORS] Unauthorized telemetry submission attempt from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing X-Sensor-Device-Key header.',
        code: 'UNAUTHORIZED_DEVICE',
      });
    }
  }

  next();
}

// Broadcast new telemetry reading to all active SSE subscribers
function broadcastTelemetry(reading) {
  const payload = JSON.stringify(reading);
  for (const client of sseClients) {
    try {
      if (client.hiveId && reading.hiveId && client.hiveId !== reading.hiveId) {
        continue;
      }
      client.res.write(`event: sensor.telemetry\ndata: ${payload}\n\n`);
    } catch (err) {
      console.error('[SENSORS] Error broadcasting to SSE client:', err.message);
      sseClients.delete(client);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /telemetry — Receive DHT11 + Vibration reading from ESP32 DevKit
// ─────────────────────────────────────────────────────────────────────────────
router.post('/telemetry', authenticateSensorDevice, async (req, res) => {
  const {
    deviceId = 'ESP32-SENSOR-01',
    hiveId = 'H-1024',
    temperature,
    humidity,
    vibration,
    vibrationValue,
    recordedAt,
  } = req.body || {};

  // 1. Validate device ID
  if (typeof deviceId !== 'string' || !deviceId.trim() || deviceId.length > 64) {
    return res.status(400).json({
      success: false,
      error: 'Invalid deviceId: must be a non-empty string under 64 characters.',
      code: 'INVALID_DEVICE_ID',
    });
  }

  // 2. Validate temperature (numeric, -20°C to 80°C)
  const tempNum = Number(temperature);
  if (temperature === null || temperature === undefined || isNaN(tempNum) || tempNum < -20 || tempNum > 80) {
    return res.status(400).json({
      success: false,
      error: 'Invalid temperature: must be a numeric value between -20°C and 80°C.',
      code: 'INVALID_TEMPERATURE',
      provided: temperature,
    });
  }

  // 3. Validate humidity (numeric, 0% to 100%)
  const humNum = Number(humidity);
  if (humidity === null || humidity === undefined || isNaN(humNum) || humNum < 0 || humNum > 100) {
    return res.status(400).json({
      success: false,
      error: 'Invalid humidity: must be a numeric value between 0% and 100%.',
      code: 'INVALID_HUMIDITY',
      provided: humidity,
    });
  }

  // 4. Validate vibration (boolean or 0/1)
  const isVibrationDetected = Boolean(
    vibration === true || vibration === 'true' || vibration === 1 || vibration === '1'
  );
  const normalizedVibrationValue =
    vibrationValue !== undefined && !isNaN(Number(vibrationValue))
      ? Number(vibrationValue)
      : isVibrationDetected
      ? 1
      : 0;

  // 5. Timestamps (UTC server time is canonical)
  const serverReceivedAt = new Date();
  let clientRecordedAt = serverReceivedAt;
  if (recordedAt && !isNaN(Date.parse(recordedAt))) {
    clientRecordedAt = new Date(recordedAt);
  }

  const readingDoc = {
    timestamp: serverReceivedAt, // Required BSON UTC date for MongoDB Timeseries collection 'READINGS'
    deviceId: deviceId.trim(),
    hiveId: (hiveId || 'H-DEFAULT').trim(),
    temperature: parseFloat(tempNum.toFixed(1)),
    humidity: parseFloat(humNum.toFixed(1)),
    vibration: isVibrationDetected,
    vibrationValue: normalizedVibrationValue,
    status: isVibrationDetected ? 'alert' : 'normal',
    recordedAt: clientRecordedAt,
    receivedAt: serverReceivedAt,
    metadata: {
      deviceId: deviceId.trim(),
      hiveId: (hiveId || 'H-DEFAULT').trim(),
      ipAddress: req.ip || req.connection?.remoteAddress,
      sensorType: 'DHT11+DIGITAL_VIBE',
      userAgent: req.get('user-agent') || 'ESP32-HTTPClient',
    },
  };

  try {
    // 6. Persist to MongoDB
    const { readings } = await getMongoContext();
    const insertResult = await readings.insertOne(readingDoc);

    const publicReading = {
      _id: insertResult.insertedId,
      ...readingDoc,
    };

    // 7. Publish to Real-Time SSE channel
    broadcastTelemetry(publicReading);

    console.log(
      `[SENSORS] Telemetry stored & broadcast: ${deviceId} (${readingDoc.hiveId}) -> Temp: ${readingDoc.temperature}°C, Hum: ${readingDoc.humidity}%, Vibe: ${readingDoc.vibration}`
    );

    res.status(201).json({
      success: true,
      status: 'stored',
      deviceId: readingDoc.deviceId,
      hiveId: readingDoc.hiveId,
      receivedAt: readingDoc.receivedAt.toISOString(),
      reading: publicReading,
    });
  } catch (err) {
    console.error('[SENSORS] Database storage failed:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to store sensor telemetry in MongoDB.',
      detail: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /stream — Server-Sent Events (SSE) Real-Time Telemetry Channel (HC-007)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stream', requireAuth, async (req, res) => {
  const hiveId = req.query.hiveId || null;
  const deviceId = req.query.deviceId || null;

  // Verify hive ownership
  if (hiveId) {
    const isAuthorized = await verifyHiveAuthorization(hiveId, req.user);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to subscribe to telemetry for this hive.',
        code: 'FORBIDDEN_HIVE_ACCESS',
      });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  const isPrivileged = (req.user?.roles || []).some((r) => ['kvic', 'admin', 'verifier'].includes(r));
  // Client subscription handle
  const client = { res, hiveId, deviceId, user: req.user, isPrivileged, producerId: req.user?.actorId };
  sseClients.add(client);

  // Send initial connected event
  res.write(
    `event: connected\ndata: ${JSON.stringify({
      status: 'connected',
      activeSubscribers: sseClients.size,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Push latest reading immediately on connect so client UI has data instantly
  try {
    const { readings } = await getMongoContext();
    const query = {};
    if (hiveId) query.hiveId = hiveId;
    if (deviceId) query.deviceId = deviceId;

    const latest = await readings.findOne(query, { sort: { timestamp: -1, receivedAt: -1 } });
    if (latest) {
      res.write(`event: sensor.telemetry\ndata: ${JSON.stringify(latest)}\n\n`);
    }
  } catch (err) {
    console.warn('[SENSORS] Could not send initial latest reading on SSE connect:', err.message);
  }

  // Heartbeat ping every 15 seconds to keep connection open through firewalls/proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(client);
    }
  }, 15000);
  heartbeat.unref();

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /latest — Retrieve the latest telemetry reading from MongoDB (HC-007)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/latest', requireAuth, async (req, res) => {
  const { hiveId, deviceId } = req.query;

  if (hiveId) {
    const isAuthorized = await verifyHiveAuthorization(hiveId, req.user);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access telemetry for this hive.',
        code: 'FORBIDDEN_HIVE_ACCESS',
      });
    }
  }

  try {
    const { readings } = await getMongoContext();
    const query = {};
    if (hiveId) query.hiveId = hiveId;
    if (deviceId) query.deviceId = deviceId;

    const latest = await readings.findOne(query, { sort: { timestamp: -1, receivedAt: -1 } });

    if (!latest) {
      return res.status(404).json({
        success: false,
        error: 'No sensor telemetry found.',
        code: 'NO_TELEMETRY',
      });
    }

    res.json({
      success: true,
      reading: latest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest sensor reading.',
      detail: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /history — Retrieve chronological telemetry history for charts (HC-007)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/history', requireAuth, async (req, res) => {
  const { hiveId, deviceId } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  if (hiveId) {
    const isAuthorized = await verifyHiveAuthorization(hiveId, req.user);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access telemetry history for this hive.',
        code: 'FORBIDDEN_HIVE_ACCESS',
      });
    }
  }

  try {
    const { readings } = await getMongoContext();
    const query = {};
    if (hiveId) query.hiveId = hiveId;
    if (deviceId) query.deviceId = deviceId;

    // Fetch latest N readings, then reverse to chronological order (oldest to newest)
    const rawReadings = await readings
      .find(query)
      .sort({ timestamp: -1, receivedAt: -1 })
      .limit(limit)
      .toArray();

    const chronological = rawReadings.reverse();

    res.json({
      success: true,
      count: chronological.length,
      readings: chronological,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sensor telemetry history.',
      detail: err.message,
    });
  }
});

export async function closeSensorResources() {
  for (const client of sseClients) {
    try {
      client.res.end();
    } catch {}
  }
  sseClients.clear();

  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch {}
    mongoClient = null;
    sensorDb = null;
    sensorReadingsCollection = null;
    mongoInitPromise = null;
  }
}

export default router;
