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