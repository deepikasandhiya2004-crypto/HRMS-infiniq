import bcrypt from 'bcryptjs';
import pool from './server/db.js';

try {
  const hash = await bcrypt.hash('TestManager@123', 10);

  await pool.query(
    'UPDATE employees SET password_hash = $1 WHERE id = $2',
    [hash, 9]
  );

  console.log('Manager password set successfully.');
} catch (err) {
  console.error('Failed:', err.message);
} finally {
  await pool.end();
}