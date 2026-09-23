import pool from './server/db.js';

const r = await pool.query(
  "SELECT key, category, config_value, updated_at FROM system_configuration WHERE category = 'employee' ORDER BY key"
);

console.table(r.rows);
await pool.end();
