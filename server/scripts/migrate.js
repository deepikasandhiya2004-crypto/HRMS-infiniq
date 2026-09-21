import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(__dirname, '../sql');

async function migrate() {
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      await pool.query(sql);
      console.log(`Applied ${file}`);
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();