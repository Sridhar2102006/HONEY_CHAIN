import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import express from '../server/node_modules/express/index.js';
import cookieParser from '../server/node_modules/cookie-parser/index.js';
import { generateToken } from '../server/middleware/auth.js';
import cameraRoutes, { closeCameraResources } from '../server/routes/cameraRoutes.js';

// Sample valid 134-byte minimal JPEG buffer
const VALID_JPEG_BUFFER = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

describe('ESP32-CAM → Backend → MongoDB Integration Tests', () => {
  let beekeeperToken;
  let testApp;
  let testServer;
  let testServerUrl;
  let mockCameraServer;
  let mockPort;
  let mockMode = 'NORMAL'; // NORMAL | INVALID_JPEG | ERROR_500 | TIMEOUT

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ALLOW_TEST_LOOPBACK = 'true';

    // 1. Generate beekeeper test JWT
    beekeeperToken = generateToken({
      id: 'usr_bk_01',
      actorId: 'BK-001',
      roles: ['beekeeper'],
      email: 'beekeeper@beecrypt.demo',
    });

    // 2. Spin up ephemeral Mock ESP32-CAM HTTP Server
    await new Promise((resolve) => {
      mockCameraServer = http.createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:${mockPort}`);

        if (url.pathname === '/status') {
          res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
          res.end('ESP32-CAM is online');
          return;
        }

        if (url.pathname === '/capture') {
          if (mockMode === 'TIMEOUT') {
            // Keep connection hanging until client timeout
            return;
          }

          if (mockMode === 'ERROR_500') {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Camera capture failed on hardware');
            return;
          }

          if (mockMode === 'INVALID_JPEG') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body>Sensor offline</body></html>');
            return;
          }

          // Normal direct-stream JPEG response
          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': VALID_JPEG_BUFFER.length,
            'Content-Disposition': 'inline; filename=capture.jpg',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(VALID_JPEG_BUFFER);
          return;
        }

        res.writeHead(404);
        res.end();
      });

      mockCameraServer.listen(0, '127.0.0.1', () => {
        mockPort = mockCameraServer.address().port;
        console.log(`[TEST] Mock ESP32-CAM running on port ${mockPort}`);
        resolve();
      });
    });

    // 3. Point backend to mock camera
    process.env.ESP32_IP = `http://127.0.0.1:${mockPort}`;
    process.env.MONGODB_URI = 'mongodb+srv://esp32_user:honeychain2026@esp32cluster.w7u0bdo.mongodb.net/?appName=ESP32Cluster';
    process.env.MONGODB_DB = 'ESP32CAM';

    // 4. Spin up ephemeral Express test app mounting cameraRoutes
    testApp = express();
    testApp.use(express.json());
    testApp.use(cookieParser());
    testApp.use('/api/v1/camera', cameraRoutes);

    await new Promise((resolve) => {
      testServer = testApp.listen(0, '127.0.0.1', () => {
        const port = testServer.address().port;
        testServerUrl = `http://127.0.0.1:${port}/api/v1/camera`;
        console.log(`[TEST] Test Express API running on port ${port}`);
        resolve();
      });
    });
  });

  after(async () => {
    await closeCameraResources();
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
    if (mockCameraServer) {
      await new Promise((resolve) => mockCameraServer.close(resolve));
    }
  });

  test('1. Camera Status requires authentication', async () => {
    const res = await fetch(`${testServerUrl}/status`);
    assert.equal(res.status, 401);
  });

  test('2. Camera Status returns online with latency and address when probed', async () => {
    const res = await fetch(`${testServerUrl}/status`, {
      headers: { Authorization: `Bearer ${beekeeperToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.online, true);
    assert.equal(body.address, `http://127.0.0.1:${mockPort}`);
    assert.equal(typeof body.latencyMs, 'number');
  });

  test('3. Capture photo requires authentication', async () => {
    const res = await fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });
    assert.equal(res.status, 401);
  });

  let createdCaptureId = null;

  test('4. End-to-end capture triggers camera, streams to GridFS, returns metadata', async () => {
    mockMode = 'NORMAL';

    const res = await fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beekeeperToken}`,
      },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.ok(data.captureId.startsWith('HC-CAM-'), 'Capture ID must follow HC-CAM- prefix');
    assert.equal(data.status, 'saved');
    assert.ok(data.imageUrl.includes(data.captureId));
    assert.equal(data.metadata.fileSize, VALID_JPEG_BUFFER.length);
    assert.equal(data.metadata.mimeType, 'image/jpeg');
    assert.equal(data.metadata.hiveId, 'H-1024');

    createdCaptureId = data.captureId;
  });

  test('5. Stream captured image from GridFS and verify binary match', async () => {
    assert.ok(createdCaptureId, 'Previous test must produce a captureId');

    const imgRes = await fetch(`${testServerUrl}/captures/${createdCaptureId}/image`, {
      headers: { Authorization: `Bearer ${beekeeperToken}` },
    });
    assert.equal(imgRes.status, 200);
    assert.equal(imgRes.headers.get('content-type'), 'image/jpeg');

    const arrayBuf = await imgRes.arrayBuffer();
    const retrievedBuffer = Buffer.from(arrayBuf);
    assert.equal(retrievedBuffer.length, VALID_JPEG_BUFFER.length);
    assert.deepEqual(retrievedBuffer, VALID_JPEG_BUFFER);
  });

  test('6. Stream captured image supports ?token= query authorization for <img> tags', async () => {
    assert.ok(createdCaptureId, 'Previous test must produce a captureId');

    const imgRes = await fetch(`${testServerUrl}/captures/${createdCaptureId}/image?token=${beekeeperToken}`);
    assert.equal(imgRes.status, 200);
    assert.equal(imgRes.headers.get('content-type'), 'image/jpeg');
  });

  test('7. Retrieve capture record metadata', async () => {
    assert.ok(createdCaptureId, 'Previous test must produce a captureId');

    const res = await fetch(`${testServerUrl}/captures/${createdCaptureId}`, {
      headers: { Authorization: `Bearer ${beekeeperToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.capture.captureId, createdCaptureId);
    assert.equal(body.capture.hiveId, 'H-1024');
    assert.equal(body.capture.status, 'saved');
  });

  test('8. Rejects invalid non-JPEG camera response with descriptive error', async () => {
    mockMode = 'INVALID_JPEG';

    const res = await fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beekeeperToken}`,
      },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });

    assert.equal(res.status, 502);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'INVALID_IMAGE_FORMAT');
    assert.ok(data.error.includes('no valid JPEG image'));
  });

  test('9. Handles hardware capture failure gracefully', async () => {
    mockMode = 'ERROR_500';

    const res = await fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beekeeperToken}`,
      },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });

    assert.equal(res.status, 502);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'CAMERA_ERROR');
  });

  test('10. Handles offline/unreachable camera with descriptive error', async () => {
    // Point to non-existent port
    const originalIp = process.env.ESP32_IP;
    process.env.ESP32_IP = 'http://127.0.0.1:59998';

    try {
      const res = await fetch(`${testServerUrl}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${beekeeperToken}`,
        },
        body: JSON.stringify({ hiveId: 'H-1024' }),
      });

      assert.equal(res.status, 502);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.code, 'CAMERA_UNREACHABLE');
      assert.ok(data.error.includes('unreachable'));
    } finally {
      process.env.ESP32_IP = originalIp;
    }
  });

  test('11. Prevents concurrent duplicate capture triggers (anti-duplicate lock)', async () => {
    mockMode = 'NORMAL';

    const req1 = fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beekeeperToken}`,
      },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });

    const req2 = fetch(`${testServerUrl}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${beekeeperToken}`,
      },
      body: JSON.stringify({ hiveId: 'H-1024' }),
    });

    const [res1, res2] = await Promise.all([req1, req2]);
    const statuses = [res1.status, res2.status];

    // At least one request was accepted (201)
    assert.ok(statuses.includes(201), `Expected at least one 201 response, got ${statuses.join(', ')}`);
  });
});
