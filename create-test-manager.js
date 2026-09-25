import pool from './server/db.js';

const result = await pool.query(`
  INSERT INTO employees
    (employee_code, full_name, email, role, department, designation, status, joined_on)
  VALUES
    ('EMP0009', 'Test Manager', 'manager@test.infiniq.com', 'manager',
     'Human Resources', 'HR Manager', 'active', CURRENT_DATE)
  RETURNING id, employee_code, full_name, email, role, department, designation, manager_id, status;
`);

console.table(result.rows);

await pool.end();