import pool from '../db.js';
import { ALL_SCOPE_ROLES } from '../config/roles.js';

const TODAY_IST = `(NOW() AT TIME ZONE 'Asia/Kolkata')::date`;

export async function getMyTeam(req, res) {
  try {
    const { rows: members } = await pool.query(
      `SELECT e.id, e.employee_code, e.full_name, e.email, e.department, e.designation,
              COALESCE(a.status, 'not_checked_in') AS today_status,
              a.check_in, a.check_out
       FROM employees e
       LEFT JOIN attendance a
         ON a.employee_id = e.id AND a.work_date = ${TODAY_IST}
       WHERE e.manager_id = $1 AND e.status = 'active'
       ORDER BY e.department NULLS LAST, e.full_name`,
      [req.user.id]
    );

    const { rows: mgr } = await pool.query(
      `SELECT m.id, m.full_name, m.designation
       FROM employees me
       JOIN employees m ON m.id = me.manager_id
       WHERE me.id = $1`,
      [req.user.id]
    );

    res.json({ manager: mgr[0] || null, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load team' });
  }
}

export async function getMember(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid employee id' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.employee_code, e.full_name, e.email, e.role, e.department,
              e.designation, e.status, e.joined_on, e.manager_id,
              m.full_name AS manager_name, m.designation AS manager_designation
       FROM employees e
       LEFT JOIN employees m ON m.id = e.manager_id
       WHERE e.id = $1`,
      [id]
    );
    const employee = rows[0];

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const allowed =
      employee.id === req.user.id ||
      employee.manager_id === req.user.id ||
      ALL_SCOPE_ROLES.includes(req.user.role);

    if (!allowed) {
      return res.status(403).json({ message: 'You do not have permission to view this profile' });
    }

    res.json({ employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load employee' });
  }
}

export async function createTeamMember(req, res) {
  const { full_name, email, department, designation } = req.body || {};

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ message: 'Please enter a name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
    return res.status(400).json({ message: 'Enter a valid email' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO employees (employee_code, full_name, email, role, department, designation, manager_id, status, joined_on)
       VALUES ('PENDING', $1, $2, 'employee', $3, $4, $5, 'active', CURRENT_DATE)
       RETURNING id`,
      [full_name.trim(), email.trim().toLowerCase(), department || null, designation || null, req.user.id]
    );
    const id = rows[0].id;
    const code = `EMP${String(id).padStart(4, '0')}`;
    await client.query(`UPDATE employees SET employee_code = $2 WHERE id = $1`, [id, code]);
    await client.query('COMMIT');

    res.status(201).json({
      employee: { id, employee_code: code, full_name: full_name.trim(), email: email.trim().toLowerCase(), department, designation },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An employee with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not add team member' });
  } finally {
    client.release();
  }
}