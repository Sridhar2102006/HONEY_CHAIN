import { Router } from 'express';
import { query, pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Test Requests
router.get('/test-requests', requireAuth, async (req, res, next) => {
  try {
    const { labId, batchId } = req.query;
    let sql = 'SELECT * FROM test_requests WHERE 1=1';
    const params = [];
    let idx = 1;

    if (labId) { sql += ` AND lab_id = $${idx++}`; params.push(labId); }
    if (batchId) { sql += ` AND batch_id = $${idx++}`; params.push(batchId); }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params);
    res.json(
      rows.map((r) => ({
        requestId: r.request_id,
        batchId: r.batch_id,
        labId: r.lab_id,
        sampleQuantityMl: r.sample_qty_ml,
        tests: r.tests,
        requestedDate: r.requested_date,
        notes: r.notes,
        status: r.status,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/test-requests', requireAuth, async (req, res, next) => {
  try {
    const { requestId, batchId, labId, sampleQuantityMl, tests, requestedDate, notes } = req.body;
    if (!batchId || !labId) {
      return res.status(400).json({ error: 'batchId and labId are required' });
    }

    const effectiveId = requestId || `REQ-${Date.now().toString().slice(-6)}`;
    const effectiveDate = requestedDate || new Date().toISOString().slice(0, 10);

    const { rows } = await query(
      `INSERT INTO test_requests (request_id, batch_id, lab_id, sample_qty_ml, tests, requested_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [effectiveId, batchId, labId, sampleQuantityMl || 250, tests || ['Purity', 'Moisture'], effectiveDate, notes || '']
    );

    // Update batch to stage 4 (Sent to Lab)
    await query(
      `UPDATE batches SET stage = 4, lab_id = $1, test_status = 'PENDING', updated_at = NOW() WHERE batch_id = $2`,
      [labId, batchId]
    );

    res.status(201).json({
      requestId: rows[0].request_id,
      batchId: rows[0].batch_id,
      labId: rows[0].lab_id,
      sampleQuantityMl: rows[0].sample_qty_ml,
      tests: rows[0].tests,
      requestedDate: rows[0].requested_date,
      notes: rows[0].notes,
      status: rows[0].status,
    });
  } catch (err) {
    next(err);
  }
});

// Quality Results
router.get('/quality-results', requireAuth, async (req, res, next) => {
  try {
    const { batchId } = req.query;
    let sql = 'SELECT * FROM quality_results';
    const params = [];
    if (batchId) {
      sql += ' WHERE batch_id = $1';
      params.push(batchId);
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params);
    res.json(
      rows.map((r) => ({
        testId: r.test_id,
        batchId: r.batch_id,
        labId: r.lab_id,
        testDate: r.test_date,
        moisture: r.moisture ? parseFloat(r.moisture) : null,
        sucrose: r.sucrose ? parseFloat(r.sucrose) : null,
        fructose: r.fructose ? parseFloat(r.fructose) : null,
        glucose: r.glucose ? parseFloat(r.glucose) : null,
        adulteration: r.adulteration,
        testStatus: r.test_status,
        verifierId: r.verifier_id,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/quality-results', requireAuth, requireRole('laboratory', 'verifier', 'kvic', 'admin'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      testId,
      batchId,
      labId,
      testDate,
      moisture,
      sucrose,
      fructose,
      glucose,
      adulteration,
      testStatus,
      verifierId,
    } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required' });
    }

    await client.query('BEGIN');

    // Verify batch exists and is in Stage 4 (Lab Requested)
    const { rows: batchRows } = await client.query('SELECT stage FROM batches WHERE batch_id = $1', [batchId]);
    if (!batchRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }
    const currentStage = Number(batchRows[0].stage);
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));
    if (currentStage !== 4 && !isPrivileged) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot record quality results: batch must be in Stage 4 (Lab Requested), currently in Stage ${currentStage}`,
      });
    }

    const effectiveId = testId || `TEST-${Date.now().toString().slice(-6)}`;
    const effectiveLab = labId || req.user.actorId;
    const effectiveStatus = testStatus || 'PASS';

    const { rows } = await client.query(
      `INSERT INTO quality_results (
        test_id, batch_id, lab_id, test_date, moisture,
        sucrose, fructose, glucose, adulteration, test_status, verifier_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        effectiveId,
        batchId,
        effectiveLab,
        testDate || new Date().toISOString().slice(0, 10),
        moisture || 17.5,
        sucrose || 35.0,
        fructose || 38.0,
        glucose || 33.0,
        adulteration || 'Not Detected',
        effectiveStatus,
        verifierId || req.user.actorId,
      ]
    );

    // Advance batch stage to 5 (Quality Verified)
    await client.query(
      `UPDATE batches SET stage = 5, test_status = $1, updated_at = NOW() WHERE batch_id = $2`,
      [effectiveStatus, batchId]
    );

    await client.query('COMMIT');

    const r = rows[0];
    res.status(201).json({
      testId: r.test_id,
      batchId: r.batch_id,
      labId: r.lab_id,
      testDate: r.test_date,
      moisture: r.moisture ? parseFloat(r.moisture) : null,
      sucrose: r.sucrose ? parseFloat(r.sucrose) : null,
      fructose: r.fructose ? parseFloat(r.fructose) : null,
      glucose: r.glucose ? parseFloat(r.glucose) : null,
      adulteration: r.adulteration,
      testStatus: r.test_status,
      verifierId: r.verifier_id,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Certificates
router.get('/certificates', requireAuth, async (req, res, next) => {
  try {
    const { batchId } = req.query;
    let sql = 'SELECT * FROM certificates';
    const params = [];
    if (batchId) {
      sql += ' WHERE batch_id = $1';
      params.push(batchId);
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params);
    res.json(
      rows.map((r) => ({
        certificateId: r.certificate_id,
        batchId: r.batch_id,
        labId: r.lab_id,
        testDate: r.test_date,
        issueDate: r.issue_date,
        result: r.result,
        verifierId: r.verifier_id,
        fileName: r.file_name,
        uploaded: r.uploaded,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/certificates', requireAuth, requireRole('laboratory', 'verifier', 'kvic', 'admin'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { certificateId, batchId, labId, testDate, issueDate, result, verifierId, fileName, uploaded } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required' });
    }

    await client.query('BEGIN');

    // Verify batch exists, is Stage 5 (Quality Verified) and test_status is PASS
    const { rows: batchRows } = await client.query('SELECT stage, test_status FROM batches WHERE batch_id = $1', [batchId]);
    if (!batchRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }

    const currentStage = Number(batchRows[0].stage);
    const testStatus = batchRows[0].test_status;
    const isPrivileged = req.user.roles?.some((r) => ['kvic', 'admin'].includes(r));

    if (currentStage !== 5 && !isPrivileged) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot issue certificate: batch must be in Stage 5 (Quality Verified), currently in Stage ${currentStage}`,
      });
    }

    if (testStatus !== 'PASS' && !isPrivileged) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot issue certificate: batch test_status must be PASS, currently ${testStatus}`,
      });
    }

    const effectiveId = certificateId || `AGMARK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const effectiveLab = labId || req.user.actorId;
    const effectiveIssueDate = issueDate || new Date().toISOString().slice(0, 10);
    const effectiveResult = result || 'PASS';
    // HC-024: Do not mark uploaded = true unless an actual file is verified/uploaded
    const isUploaded = Boolean(fileName && uploaded === true);

    const { rows } = await client.query(
      `INSERT INTO certificates (
        certificate_id, batch_id, lab_id, test_date, issue_date, result, verifier_id, file_name, uploaded
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        effectiveId,
        batchId,
        effectiveLab,
        testDate || effectiveIssueDate,
        effectiveIssueDate,
        effectiveResult,
        verifierId || req.user.actorId,
        fileName || null,
        isUploaded,
      ]
    );

    // Advance batch stage to 6 (Certified)
    await client.query(
      `UPDATE batches SET stage = 6, certificate_id = $1, cert_status = 'CERTIFIED', updated_at = NOW() WHERE batch_id = $2`,
      [effectiveId, batchId]
    );

    await client.query('COMMIT');

    const r = rows[0];
    res.status(201).json({
      certificateId: r.certificate_id,
      batchId: r.batch_id,
      labId: r.lab_id,
      testDate: r.test_date,
      issueDate: r.issue_date,
      result: r.result,
      verifierId: r.verifier_id,
      fileName: r.file_name,
      uploaded: r.uploaded,
      documentStatus: r.uploaded ? 'CERTIFICATE_DOCUMENT_AVAILABLE' : 'CERTIFICATE_METADATA_ONLY',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
