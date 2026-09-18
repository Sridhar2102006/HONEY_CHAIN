/**
 * clean.js — Reset operational database tables in BeeCrypt
 *
 * Empties all hives, batches, inspections, lab tests, certificates,
 * provenance events, alerts, and pending applications so users can
 * manually test the honey supply chain lifecycle from scratch.
 * Preserves user accounts and organizations so logins work out of the box.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const TABLES_TO_CLEAN = [
  'alerts',
  'notifications',
  'certificates',
  'quality_results',
  'test_requests',
  'inspections',
  'provenance_events',
  'batch_relationships',
  'batches',
  'hives',
  'pending_applications',
];

async function runClean() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[SECURITY ERROR] Database clean operation is strictly prohibited in production mode.');
    process.exit(1);
  }

  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('No DATABASE_URL configured in server/.env');
    process.exit(1);
  }

  console.log('🧹 Cleaning operational tables in BeeCrypt database...');

  // If using Neon over HTTPS / port 443
  if (connStr.includes('neon.tech')) {
    try {
      const sql = `TRUNCATE TABLE ${TABLES_TO_CLEAN.join(', ')} CASCADE;`;
      const url = new URL(connStr);
      const endpoint = `https://${url.hostname}/sql`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Neon-Connection-String': connStr,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      console.log('✅ All operational tables successfully truncated via Neon SQL API.');
      console.log('Ready for fresh manual data entry through the BeeCrypt app!');
      return;
    } catch (err) {
      console.warn('Neon HTTP endpoint failed, falling back to pg.Pool:', err.message);
    }
  }

  // Fallback to standard pg client for local postgres or direct TCP
  const client = new pg.Client({
    connectionString: connStr,
    ssl: connStr.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
    const sql = `TRUNCATE TABLE ${TABLES_TO_CLEAN.join(', ')} CASCADE;`;
    await client.query(sql);
    console.log('✅ All operational tables successfully truncated.');
    console.log('Ready for fresh manual data entry through the BeeCrypt app!');
  } catch (err) {
    console.error('❌ Failed to clean tables:', err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runClean();
