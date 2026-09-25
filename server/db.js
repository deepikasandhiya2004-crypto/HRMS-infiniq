import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '.env'),
});

console.log(
  'DB HOST:',
  process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).hostname
    : 'DATABASE_URL NOT FOUND'
);

pg.types.setTypeParser(1082, (value) => value);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;