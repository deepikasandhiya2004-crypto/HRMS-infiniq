import pool from './server/db.js';

const r = await pool.query(`
  SELECT key, category, config_value, updated_by, updated_at
  FROM system_configuration
  WHERE key = 'employee'
`);

console.dir(r.rows, { depth: 10 });

await pool.end();
