import pool from './server/db.js';

const result = await pool.query(`
  SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM information_schema.columns
  WHERE table_name = 'employees'
  ORDER BY ordinal_position
`);

console.table(result.rows);

await pool.end();