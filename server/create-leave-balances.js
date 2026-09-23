import pool from './db.js';

const result = await pool.query(`
  INSERT INTO leave_balances
    (employee_id, leave_type_id, year, allocated, used, pending)
  SELECT
    e.id,
    lt.id,
    2026,
    lt.annual_allocation,
    0,
    0
  FROM employees e
  CROSS JOIN leave_types lt
  WHERE e.status = 'active'
    AND lt.active = true
  ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING
`);

console.log(`2026 leave balances created: ${result.rowCount}`);
await pool.end();
