import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting database migrations...');

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Read all SQL files from migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 3. Get list of already applied migrations
    const { rows: appliedRows } = await client.query(
      'SELECT name FROM schema_migrations'
    );
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 4. Run pending migrations in order
    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      console.log(`  ⏳ Applying ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Strip SQL comments and split into distinct statements for Neon HTTP compatibility
      const cleanSql = sql.replace(/--.*$/gm, '');
      const statements = cleanSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      try {
        for (const statement of statements) {
          if (statement) {
            await client.query(statement);
          }
        }
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [file]
        );
        console.log(`  ✔ ${file} applied successfully.`);
        count++;
      } catch (err) {
        console.error(`  ❌ Failed to apply ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`\n🎉 Migrations complete! Applied ${count} new migration(s).`);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
