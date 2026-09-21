import pool from '../db.js';

// Only these fields can be changed through the preferences endpoint.
// Each one has its own validator.
const PREFERENCE_FIELDS = {
  theme: (v) => ['light', 'dark', 'system'].includes(v),
  email_enabled: (v) => typeof v === 'boolean',
  in_app_enabled: (v) => typeof v === 'boolean',
  request_updates: (v) => typeof v === 'boolean',
  approval_reminders: (v) => typeof v === 'boolean',
};

async function loadSettings(userId) {
  // Create the settings row with defaults the first time (safe to repeat)
  await pool.query(
    `INSERT INTO employee_settings (employee_id) VALUES ($1)
     ON CONFLICT (employee_id) DO NOTHING`,
    [userId]
  );

  const { rows } = await pool.query(
    `SELECT e.employee_code, e.full_name, e.email, e.phone, e.department,
            e.designation, e.joined_on, m.full_name AS manager_name,
            s.theme, s.email_enabled, s.in_app_enabled,
            s.request_updates, s.approval_reminders
     FROM employees e
     LEFT JOIN employees m ON m.id = e.manager_id
     JOIN employee_settings s ON s.employee_id = e.id
     WHERE e.id = $1`,
    [userId]
  );
  const r = rows[0];

  return {
    account: {
      employee_code: r.employee_code,
      full_name: r.full_name,
      email: r.email,
      phone: r.phone,
      department: r.department,
      designation: r.designation,
      joined_on: r.joined_on,
      manager_name: r.manager_name,
    },
    preferences: {
      theme: r.theme,
      email_enabled: r.email_enabled,
      in_app_enabled: r.in_app_enabled,
      request_updates: r.request_updates,
      approval_reminders: r.approval_reminders,
    },
  };
}

export async function getSettings(req, res) {
  try {
    res.json(await loadSettings(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load settings' });
  }
}

export async function updateAccount(req, res) {
  const body = req.body || {};
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  const unknown = keys.filter((k) => k !== 'phone');
  if (unknown.length > 0) {
    return res.status(400).json({ message: `You cannot change: ${unknown.join(', ')}` });
  }

  let phone = body.phone;
  if (phone !== null) {
    if (typeof phone !== 'string') {
      return res.status(400).json({ message: 'phone must be a string or null' });
    }
    phone = phone.replace(/[\s-]/g, '');
    if (phone === '') {
      phone = null;
    } else if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }
  }

  try {
    await pool.query(`UPDATE employees SET phone = $2 WHERE id = $1`, [req.user.id, phone]);
    res.json(await loadSettings(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update account' });
  }
}

export async function updatePreferences(req, res) {
  const body = req.body || {};
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  for (const key of keys) {
    if (!Object.hasOwn(PREFERENCE_FIELDS, key)) {
      return res.status(400).json({ message: `Unknown setting: ${key}` });
    }
    if (!PREFERENCE_FIELDS[key](body[key])) {
      return res.status(400).json({ message: `Invalid value for ${key}` });
    }
  }

  // Column names come only from the whitelist above; values are parameterized.
  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
  const updates = keys.map((k) => `${k} = EXCLUDED.${k}`).join(', ');

  try {
    await pool.query(
      `INSERT INTO employee_settings (employee_id, ${columns})
       VALUES ($1, ${placeholders})
       ON CONFLICT (employee_id)
       DO UPDATE SET ${updates}, updated_at = NOW()`,
      [req.user.id, ...keys.map((k) => body[k])]
    );
    res.json(await loadSettings(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update preferences' });
  }
}