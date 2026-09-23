import pool from './db.js';

await pool.query(`
  UPDATE leave_types
  SET annual_allocation = CASE code
    WHEN 'CL' THEN 12
    WHEN 'SL' THEN 12
    WHEN 'EL' THEN 30
  END
  WHERE code IN ('CL', 'SL', 'EL')
`);

console.log('Leave types updated');
await pool.end();
