import pool from './db.js';

await pool.query(`
  UPDATE leave_balances lb
  SET allocated = lt.annual_allocation,
      updated_at = NOW()
  FROM leave_types lt
  WHERE lb.leave_type_id = lt.id
    AND lb.year = 2026
`);

console.log('2026 leave balances updated');
await pool.end();
