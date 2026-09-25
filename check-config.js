import pool from "./server/db.js";

const r = await pool.query(
  "SELECT key, category, config_value FROM system_configuration ORDER BY category, key"
);

console.table(r.rows);

await pool.end();
