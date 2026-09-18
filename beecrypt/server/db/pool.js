import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env reliably whether started from root or server/
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to root .env if any

const { Pool } = pg;

const connStr = process.env.DATABASE_URL || '';
const isNeon = connStr.includes('neon.tech');

// Determine SSL requirement
const requiresSsl = (url) =>
  url.includes('sslmode=require') ||
  url.includes('channel_binding=require') ||
  url.includes('neon.tech') ||
  process.env.NODE_ENV === 'production';

const poolConfig = connStr
  ? {
      connectionString: connStr,
      ssl: requiresSsl(connStr) ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'beecrypt',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    };

const nativePool = new Pool(poolConfig);

nativePool.on('error', (err) => {
  console.warn('PostgreSQL pool idle notice:', err.message);
});

/**
 * Execute query via Neon HTTP API (port 443 HTTPS).
 * Bypasses network firewalls that block direct TCP port 5432 on campus/institutional networks.
 */
async function queryNeonHttp(text, params = []) {
  const url = new URL(connStr);
  const endpoint = `https://${url.hostname}/sql`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': connStr,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: text,
      params: params || [],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(errText);
    } catch {
      parsed = null;
    }
    const err = new Error(parsed?.message || `Neon HTTP error (${res.status}): ${errText}`);
    err.code = parsed?.code;
    throw err;
  }

  const data = await res.json();
  return {
    rows: data.rows || [],
    rowCount: data.rowCount ?? (data.rows ? data.rows.length : 0),
    command: data.command,
    fields: data.fields,
  };
}

/**
 * Robust query execution:
 * Prefers Neon HTTPS over port 443 when on a Neon connection,
 * or standard pg Pool for local PostgreSQL.
 */
export const query = async (text, params) => {
  if (isNeon) {
    try {
      return await queryNeonHttp(text, params);
    } catch {
      // Fallback to native pool if HTTP fails
      return nativePool.query(text, params);
    }
  }
  return nativePool.query(text, params);
};

export const pool = {
  query: (text, params) => query(text, params),
  connect: async () => {
    if (isNeon) {
      return {
        query: (text, params) => queryNeonHttp(text, params),
        release: () => {},
      };
    }
    return nativePool.connect();
  },
  end: () => nativePool.end(),
};
