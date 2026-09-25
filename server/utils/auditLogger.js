import pool from "../db.js";

export async function createAuditLog({
  userId,
  action,
  module,
  description,
  targetId = null,
  targetName = null,
  req = null,
}) {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        module,
        description,
        target_id,
        target_name,
        ip_address,
        user_agent
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        userId || null,
        action,
        module,
        description || null,
        targetId,
        targetName,
        req?.ip || null,
        req?.get("user-agent") || null,
      ]
    );
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
}