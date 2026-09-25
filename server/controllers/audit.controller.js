import pool from "../db.js";

export async function getAuditLogs(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        COALESCE(e.full_name, 'System') AS user,
        a.action,
        a.module,
        a.description,
        a.target_id,
        a.target_name,
        a.ip_address,
        a.user_agent,
        a.created_at
      FROM audit_logs a
      LEFT JOIN employees e
        ON e.id = a.user_id
      ORDER BY a.created_at DESC
    `);

    res.json({
      logs: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);

    res.status(500).json({
      message: "Could not load audit logs",
    });
  }
}

export async function getAdminHistory(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        COALESCE(e.full_name, 'System') AS admin,
        a.action,
        COALESCE(a.target_name, '-') AS target,
        a.module,
        a.description,
        a.created_at,
        a.ip_address
      FROM audit_logs a
      LEFT JOIN employees e
        ON e.id = a.user_id
      WHERE
        a.action IN (
          'Created',
          'Updated',
          'Deleted',
          'Configuration',
          'Created User',
          'Updated Role'
        )
        OR a.module IN (
          'Users',
          'Permissions',
          'Configuration',
          'Organization'
        )
      ORDER BY a.created_at DESC
    `);

    res.json({
      history: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET ADMIN HISTORY ERROR:", error);

    res.status(500).json({
      message: "Could not load admin history",
    });
  }
}