import pool from '../db.js';

const VALID_CATEGORIES = [
  'general',
  'employee',
  'attendance',
  'leave',
  'workflows',
  'roles_permissions',
];

export async function getConfig(req, res) {
  const { category } = req.params;

  if (category && category !== 'all' && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `Invalid configuration category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  try {
    if (!category || category === 'all') {
      const { rows } = await pool.query(`SELECT key, config_value, updated_at FROM system_configuration`);
      const allConfig = {};
      rows.forEach((r) => {
        allConfig[r.key] = r.config_value;
      });
      return res.json({ config: allConfig });
    }

    const { rows } = await pool.query(
      `SELECT key, category, config_value, updated_at, updated_by
       FROM system_configuration
       WHERE key = $1`,
      [category]
    );

    if (!rows[0]) {
      return res.json({ category, config: null, updated_at: null });
    }

    res.json({
      category: rows[0].category,
      config: rows[0].config_value,
      updated_at: rows[0].updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load configuration' });
  }
}

export async function updateConfig(req, res) {
  const { category } = req.params;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `Invalid configuration category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  const configValue = req.body;
  if (!configValue || typeof configValue !== 'object') {
    return res.status(400).json({ message: 'Configuration payload must be an object or array' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO system_configuration (key, category, config_value, updated_by, updated_at)
       VALUES ($1, $1, $2::jsonb, $3, NOW())
       ON CONFLICT (key)
       DO UPDATE SET config_value = $2::jsonb, updated_by = $3, updated_at = NOW()
       RETURNING *`,
      [category, JSON.stringify(configValue), req.user.id]
    );

    res.json({
      category: rows[0].category,
      config: rows[0].config_value,
      updated_at: rows[0].updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update configuration' });
  }
}
