import jwt from 'jsonwebtoken';
import pool from '../db.js';

export default async function authGuard(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      `SELECT id, employee_code, full_name, email, role, department, designation, manager_id
       FROM employees WHERE id = $1 AND status = 'active'`,
      [payload.id]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Account not found' });
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}