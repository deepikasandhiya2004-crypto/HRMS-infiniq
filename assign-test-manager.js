import pool from './server/db.js';

const result = await pool.query(`
  UPDATE employees
  SET manager_id = 9,
      department = 'Human Resources',
      designation = 'Employee'
  WHERE id = 8
  RETURNING id, employee_code, full_name, role, department, designation, manager_id;
`);

console.table(result.rows);

await pool.end();