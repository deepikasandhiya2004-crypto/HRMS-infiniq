import pool from "./db.js";

const result = await pool.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name ILIKE '%audit%'
`);

console.log(result.rows);

await pool.end();
