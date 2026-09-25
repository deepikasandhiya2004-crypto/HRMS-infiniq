import pool from '../db.js';
import jwt from 'jsonwebtoken';

export default async function currentUser(req, res, next) {
  try {
    let id = null;

    // ==========================================
    // 1. Try JWT authentication first
    // ==========================================
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded?.id) {
          id = Number(decoded.id);
        }
      } catch (err) {
        return res.status(401).json({
          message: 'Invalid or expired authentication token',
        });
      }
    }

    // ==========================================
    // 2. Development fallback
    // ==========================================
    if (!id && process.env.NODE_ENV !== 'production') {
      const devId = Number(req.header('x-employee-id'));

      if (Number.isInteger(devId) && devId > 0) {
        id = devId;
      }
    }

    // ==========================================
    // 3. No authentication available
    // ==========================================
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    // ==========================================
    // 4. Load employee from database
    // ==========================================
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
        message: 'Employee not found or inactive',
      });
    }

    req.user = rows[0];

    next();
  } catch (err) {
    console.error('currentUser error:', err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}
