import pool from "./db.js";

await pool.query(`
  INSERT INTO audit_logs
    (user_id, action, module, description, target_name)
  VALUES
    (NULL, 'Created', 'Organization', 'Created a new team for testing audit logs', 'Backend Team')
`);

console.log("Test audit log inserted successfully");

await pool.end();
