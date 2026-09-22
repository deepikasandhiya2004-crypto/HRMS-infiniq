import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, employee_code, full_name, email, role, password_hash, status
       FROM employees WHERE email = $1`,
      [email.trim().toLowerCase()]
    );
    const employee = rows[0];
    if (!employee || !employee.password_hash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (employee.status !== 'active') {
      return res.status(403).json({ message: 'This account is inactive' });
    }
    const ok = await bcrypt.compare(password, employee.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: employee.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: {
        id: employee.id, employee_code: employee.employee_code,
        full_name: employee.full_name, email: employee.email, role: employee.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not log in' });
  }
}

export async function signup(req, res) {
  const { full_name, email, password } = req.body || {};
  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ message: 'Please enter your name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
    return res.status(400).json({ message: 'Enter a valid email' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `INSERT INTO employees (employee_code, full_name, email, password_hash, role, status, joined_on)
       VALUES ('PENDING', $1, $2, $3, 'employee', 'active', CURRENT_DATE)
       RETURNING id`,
      [full_name.trim(), normalizedEmail, hash]
    );
    const id = rows[0].id;
    const code = `EMP${String(id).padStart(4, '0')}`;
    await client.query(`UPDATE employees SET employee_code = $2 WHERE id = $1`, [id, code]);
    await client.query('COMMIT');

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({
      token,
      user: { id, employee_code: code, full_name: full_name.trim(), email: normalizedEmail, role: 'employee' },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not create account' });
  } finally {
    client.release();
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  const generic = { message: 'If an account exists for that email, a reset link has been generated.' };
  if (!email) return res.json(generic);

  try {
    const { rows } = await pool.query(
      `SELECT id FROM employees WHERE email = $1 AND status = 'active'`,
      [email.trim().toLowerCase()]
    );
    if (!rows[0]) return res.json(generic);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `UPDATE employees SET reset_token_hash = $2, reset_token_expires = $3 WHERE id = $1`,
      [rows[0].id, tokenHash, expires]
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    console.log(`[DEV ONLY] Password reset link: ${resetLink}`);

    // dev_reset_link is only here because no real email service is connected yet.
    // Remove this field once an email provider sends the link instead.
    res.json({ ...generic, dev_reset_link: resetLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not process request' });
  }
}

export async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const { rows } = await pool.query(
      `SELECT id FROM employees WHERE reset_token_hash = $1 AND reset_token_expires > NOW()`,
      [tokenHash]
    );
    if (!rows[0]) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE employees SET password_hash = $2, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = $1`,
      [rows[0].id, hash]
    );
    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not reset password' });
  }
}