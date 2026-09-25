import jwt from 'jsonwebtoken';
import pool from '../db.js';

export default async function authGuard(req, res, next) {
  try {
    let id = null;

    // 1. Try JWT first
    const header = req.header('authorization') || '';

    if (header.startsWith('Bearer ')) {
      const token = header.slice(7);

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (payload?.id) {
          id = Number(payload.id);
        }
      } catch (err) {
        return res.status(401).json({
          message: 'Invalid or expired session',
        });
      }
    }

    // 2. Development fallback
    if (!id && process.env.NODE_ENV !== 'production') {
      const devId = Number(req.header('x-employee-id'));

      if (Number.isInteger(devId) && devId > 0) {
        id = devId;
      }
    }

    // 3. No authentication
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({
        message: 'Not authenticated',
      });
    }

    // 4. Load employee
    const { rows } = await pool.query(
      `SELECT
        id,
        employee_code,
        full_name,
        email,
        role,
        department,
        designation,
        manager_id,
        status
       FROM employees
       WHERE id = $1
         AND status = 'active'`,
      [id]
    );

    if (!rows[0]) {
      return res.status(401).json({
        message: 'Account not found or inactive',
      });
    }

    req.user = rows[0];

    next();
  } catch (err) {
    console.error('authGuard error:', err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}
