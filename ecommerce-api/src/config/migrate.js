/**
 * Database migration runner.
 * Jalankan: npm run db:migrate
 * Baca schema.sql dan execute semua statement.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./database');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');

async function migrate() {
  const sql = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  console.log('Running migrations...');

  try {
    // Execute raw SQL
    await query(sql);
    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
