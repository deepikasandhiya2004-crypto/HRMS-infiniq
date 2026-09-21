import pool from '../db.js';

export default async function currentUser(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(501).json({ message: 'Authentication not connected yet' });
  }

  const id = Number(req.header('x-employee-id'));
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(401).json({ message: 'x-employee-id header required (dev only)' });
  }

  try {
        const { rows } = await pool.query(
      `SELECT id, employee_code, full_name, email, role, department, designation, manager_id
       FROM employees WHERE id = $1 AND status = 'active'`,
      [id]
    );
    if (!rows[0]) {
      return res.status(401).json({ message: 'Employee not found' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}