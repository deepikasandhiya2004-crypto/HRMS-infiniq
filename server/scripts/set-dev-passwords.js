import bcrypt from 'bcryptjs';
import pool from '../db.js';

const PASSWORD = 'Passw0rd!';

async function run() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const { rows } = await pool.query(
    `UPDATE employees SET password_hash = $1 RETURNING email, full_name, role`,
    [hash]
  );
  console.log(`Password set to "${PASSWORD}" for:`);
  rows.forEach((r) => console.log(`  ${r.email} (${r.role})`));
  await pool.end();
}

run();