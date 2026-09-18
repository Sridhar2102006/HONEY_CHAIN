import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from '../server/node_modules/express/index.js';
import cookieParser from '../server/node_modules/cookie-parser/index.js';
import sensorRoutes, { closeSensorResources } from '../server/routes/sensorRoutes.js';
import { MongoClient } from '../server/node_modules/mongodb/lib/index.js';
import { generateToken } from '../server/middleware/auth.js';

describe('ESP32 DevKit Telemetry ➔ Backend ➔ MongoDB ➔ Real-Time SSE Integration Tests', () => {
  let testApp;
  let testServer;
  let baseUrl;
  let mongoClient;
  let readingsCollection;
  let authToken;
  const SENSOR_KEY = 'beecrypt_sensor_secret_key_2026';
  const TEST_DEVICE_ID = 'ESP32-TEST-DEVKIT-01';
  const TEST_HIVE_ID = 'H-TEST-99';

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SENSOR_DEVICE_KEY = SENSOR_KEY;
    process.env.MONGODB_URI = 'mongodb+srv://esp32_user:honeychain2026@esp32cluster.w7u0bdo.mongodb.net/?appName=ESP32Cluster';
    process.env.MONGODB_DB = 'ESP32CAM';

    authToken = generateToken({
      id: 'usr_bk_01',
      actorId: 'BK-001',
      roles: ['beekeeper'],
      email: 'beekeeper@beecrypt.demo',
    });

    // Connect to MongoDB Atlas to verify schema and clean test docs
    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    await mongoClient.connect();
    const collectionName = process.env.MONGODB_SENSOR_COLLECTION || 'READINGS';
    readingsCollection = mongoClient.db(process.env.MONGODB_DB).collection(collectionName);

    // Spin up test server mounting sensorRoutes
    testApp = express();
    testApp.use(express.json());
    testApp.use(cookieParser());
    testApp.use('/api/v1/sensors', sensorRoutes);

    await new Promise((resolve) => {
      testServer = testApp.listen(0, '127.0.0.1', () => {
        const port = testServer.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1/sensors`;
        console.log(`[TEST] Sensor Test Express Server running on port ${port}`);
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up test data
    if (readingsCollection) {
      await readingsCollection.deleteMany({ deviceId: TEST_DEVICE_ID });
    }
    if (mongoClient) {
      await mongoClient.close();
    }
    await closeSensorResources();
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
  });

  test('1. Rejects telemetry submission without device authentication key (401)', async () => {
    const res = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        hiveId: TEST_HIVE_ID,
        temperature: 28.5,
        humidity: 62.0,
        vibration: false,
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.code, 'UNAUTHORIZED_DEVICE');
  });

  test('2. Rejects invalid or out-of-bounds temperature values (400)', async () => {
    // Non-numeric
    const res1 = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        temperature: 'super_hot',
        humidity: 60,
      }),
    });
    assert.equal(res1.status, 400);
    const body1 = await res1.json();
    assert.equal(body1.code, 'INVALID_TEMPERATURE');

    // Below minimum -20°C
    const res2 = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        temperature: -35.0,
        humidity: 60,
      }),
    });
    assert.equal(res2.status, 400);

    // Above maximum 80°C
    const res3 = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        temperature: 95.0,
        humidity: 60,
      }),
    });
    assert.equal(res3.status, 400);
  });

  test('3. Rejects invalid or out-of-bounds humidity values (400)', async () => {
    // Greater than 100%
    const res1 = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        temperature: 25.0,
        humidity: 120.0,
      }),
    });
    assert.equal(res1.status, 400);
    const body1 = await res1.json();
    assert.equal(body1.code, 'INVALID_HUMIDITY');

    // Negative humidity
    const res2 = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        temperature: 25.0,
        humidity: -5.0,
      }),
    });
    assert.equal(res2.status, 400);
  });

  test('4. Accepts valid DHT11 + Vibration telemetry, stores to MongoDB, and returns 201', async () => {
    const payload = {
      deviceId: TEST_DEVICE_ID,
      hiveId: TEST_HIVE_ID,
      temperature: 29.4,
      humidity: 65.2,
      vibration: false,
      vibrationValue: 0,
      recordedAt: new Date().toISOString(),
    };

    const res = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.status, 'stored');
    assert.equal(body.deviceId, TEST_DEVICE_ID);
    assert.equal(body.hiveId, TEST_HIVE_ID);
    assert.equal(body.reading.temperature, 29.4);
    assert.equal(body.reading.humidity, 65.2);
    assert.equal(body.reading.vibration, false);
    assert.equal(body.reading.status, 'normal');

    // Verify document in MongoDB
    const doc = await readingsCollection.findOne({ deviceId: TEST_DEVICE_ID });
    assert.ok(doc, 'Document should exist in MongoDB');
    assert.equal(doc.temperature, 29.4);
    assert.equal(doc.humidity, 65.2);
    assert.equal(doc.vibration, false);
    assert.ok(doc.receivedAt instanceof Date, 'receivedAt must be UTC Date');
  });

  test('5. Handles active vibration alert state correctly', async () => {
    const payload = {
      deviceId: TEST_DEVICE_ID,
      hiveId: TEST_HIVE_ID,
      temperature: 31.0,
      humidity: 58.0,
      vibration: true,
      vibrationValue: 1,
    };

    const res = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-device-key': SENSOR_KEY,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.reading.vibration, true);
    assert.equal(body.reading.status, 'alert');
  });

  test('5b. Telemetry read endpoints reject unauthenticated requests with 401 (HC-007)', async () => {
    const resLatest = await fetch(`${baseUrl}/latest?deviceId=${TEST_DEVICE_ID}`);
    assert.equal(resLatest.status, 401);

    const resHistory = await fetch(`${baseUrl}/history?deviceId=${TEST_DEVICE_ID}`);
    assert.equal(resHistory.status, 401);

    const resStream = await fetch(`${baseUrl}/stream?hiveId=${TEST_HIVE_ID}`);
    assert.equal(resStream.status, 401);
  });

  test('6. GET /latest retrieves the newest sensor reading from MongoDB (authenticated)', async () => {
    const res = await fetch(`${baseUrl}/latest?deviceId=${TEST_DEVICE_ID}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.reading);
    assert.equal(body.reading.deviceId, TEST_DEVICE_ID);
    assert.equal(body.reading.temperature, 31.0); // Most recent reading
    assert.equal(body.reading.vibration, true);
  });

  test('7. GET /history retrieves chronological readings for charts (authenticated)', async () => {
    const res = await fetch(`${baseUrl}/history?deviceId=${TEST_DEVICE_ID}&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.readings));
    assert.equal(body.count, 2);
    // Chronological order: first reading is 29.4°C, second reading is 31.0°C
    assert.equal(body.readings[0].temperature, 29.4);
    assert.equal(body.readings[1].temperature, 31.0);
  });

  test('8. Real-time SSE channel broadcasts live telemetry upon ingestion (authenticated)', async () => {
    // Connect to SSE stream with Authorization header
    const controller = new AbortController();
    const sseResponse = await fetch(`${baseUrl}/stream?hiveId=${TEST_HIVE_ID}`, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    assert.equal(sseResponse.status, 200);
    assert.equal(sseResponse.headers.get('content-type'), 'text/event-stream');

    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder();

    // Ingest a new reading to trigger real-time broadcast
    const newTelemetry = {
      deviceId: TEST_DEVICE_ID,
      hiveId: TEST_HIVE_ID,
      temperature: 33.3,
      humidity: 50.0,
      vibration: false,
      vibrationValue: 0,
    };

    // Wait a brief tick then post telemetry
    setTimeout(async () => {
      await fetch(`${baseUrl}/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sensor-device-key': SENSOR_KEY,
        },
        body: JSON.stringify(newTelemetry),
      });
    }, 100);

    // Read chunks from SSE stream until our 33.3°C reading arrives
    let receivedReading = null;
    const deadline = Date.now() + 5000;

    while (Date.now() < deadline && !receivedReading) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text.includes('sensor.telemetry')) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('data: ')) {
            try {
              const data = JSON.parse(lines[i].slice(6));
              if (data.temperature === 33.3) {
                receivedReading = data;
                break;
              }
            } catch {}
          }
        }
      }
    }

    controller.abort();

    assert.ok(receivedReading, 'SSE stream should receive real-time telemetry event for 33.3°C reading');
    assert.equal(receivedReading.deviceId, TEST_DEVICE_ID);
    assert.equal(receivedReading.temperature, 33.3);
    assert.equal(receivedReading.humidity, 50.0);
  });
});
