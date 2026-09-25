import pool from "./server/db.js";

const r = await pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'system_configuration'
  ORDER BY ordinal_position
`);

console.table(r.rows);
await pool.end();
