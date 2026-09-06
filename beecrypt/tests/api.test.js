import { test, describe, skip } from 'node:test';
import assert from 'node:assert/strict';

const API_BASE = 'http://localhost:3001/api/v1';

describe('Neon PostgreSQL Backend Integration Tests', () => {
  let authToken = null;
  const testHiveId = `H-TEST-${Date.now().toString().slice(-4)}`;
  const testBatchId = `BEE-TEST-${Date.now().toString().slice(-6)}`;

  test('1. Health check returns database connected', async () => {
    let res;
    try {
      res = await fetch(`${API_BASE}/health`);
    } catch (networkErr) {
      throw new Error(`BLOCKED — Server not reachable: ${networkErr.message}`);
    }
    const body = await res.json();
    if (res.status === 503) {
      throw new Error(`BLOCKED — Database disconnected: ${body.error || body.database}`);
    }
    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'connected');
  });

  test('2. Login as beekeeper issues valid JWT token', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'beekeeper@beecrypt.demo',
        password: 'demo123',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'JWT token should be returned');
    assert.equal(body.user.actorId, 'BK-001');
    assert.ok(body.user.roles.includes('beekeeper'));
    authToken = body.token;
  });

  test('3. Scoped hive listing filters by beekeeper actor ID', async () => {
    if (!authToken) throw new Error('BLOCKED — authToken unavailable (test 2 failed)');
    const res = await fetch(`${API_BASE}/hives`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const hives = await res.json();
    assert.ok(Array.isArray(hives));
    assert.ok(hives.length >= 1);
    for (const h of hives) {
      assert.equal(h.producerId, 'BK-001');
    }
  });

  test('4. Register new hive persists to Neon PostgreSQL', async () => {
    if (!authToken) throw new Error('BLOCKED — authToken unavailable (test 2 failed)');
    const res = await fetch(`${API_BASE}/hives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        hiveId: testHiveId,
        block: 'Apiary A — Block Test',
        region: 'Erode',
      }),
    });
    assert.equal(res.status, 201);
    const hive = await res.json();
    assert.equal(hive.hiveId, testHiveId);
    assert.equal(hive.producerId, 'BK-001');
  });

  test('5. Record inspection for newly created hive', async () => {
    if (!authToken) throw new Error('BLOCKED — authToken unavailable (test 2 failed)');
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        hiveId: testHiveId,
        queenStatus: 'Active & Laying',
        colonyStrength: 'Strong (9 frames)',
        notes: 'API integration test inspection',
      }),
    });
    assert.equal(res.status, 201);
    const insp = await res.json();
    assert.equal(insp.hiveId, testHiveId);
    assert.equal(insp.queenStatus, 'Active & Laying');
  });

  test('6. Harvest a new honey batch', async () => {
    if (!authToken) throw new Error('BLOCKED — authToken unavailable (test 2 failed)');
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        batchId: testBatchId,
        hiveId: testHiveId,
        honeyType: 'Wildflower',
        floralSource: 'Eucalyptus',
        quantity: 25.0,
      }),
    });
    assert.equal(res.status, 201);
    const batch = await res.json();
    assert.equal(batch.batchId, testBatchId);
    assert.equal(batch.stage, 1);
    assert.equal(batch.quantity, 25.0);
  });

  test('7. Record provenance event with cryptographic hash chaining', async () => {
    if (!authToken) throw new Error('BLOCKED — authToken unavailable (test 2 failed)');
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        batchId: testBatchId,
        eventType: 'HARVESTED',
        payload: { hiveId: testHiveId, quantity: 25.0 },
      }),
    });
    assert.equal(res.status, 201);
    const event = await res.json();
    assert.equal(event.batchId, testBatchId);
    assert.ok(event.payloadHash, 'Payload hash should be computed with SHA-256');
    assert.equal(event.blockchainStatus, 'NOT_CONNECTED');
  });
});
