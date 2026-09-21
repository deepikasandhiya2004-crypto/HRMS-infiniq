import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/seed_dev.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Test employees added');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();