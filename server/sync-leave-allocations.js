import pool from './server/db.js';

await pool.query(`
  UPDATE leave_types
  SET annual_allocation = CASE code
    WHEN 'CL' THEN 12
    WHEN 'SL' THEN 12
    WHEN 'EL' THEN 30
  END
  WHERE code IN ('CL', 'SL', 'EL')
`);

await pool.query(`
  UPDATE leave_balances lb
  SET allocated = lt.annual_allocation,
      updated_at = NOW()
  FROM leave_types lt
  WHERE lb.leave_type_id = lt.id
    AND lb.year = 2026
`);

console.log('Leave allocations synced');
await pool.end();
