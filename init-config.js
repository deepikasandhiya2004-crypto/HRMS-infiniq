import pool from "./server/db.js";

const defaults = {
  general: {
    companyName: "",
    legalName: "",
    timezone: "Asia/Kolkata",
    currency: "INR"
  },

  employee: {
    idPrefix: "EMP",
    startSequence: 1,
    departments: [],
    designations: [],
    locations: [],
    requiredFields: []
  },

  attendance: {
    shifts: [],
    gracePeriod: 15,
    rules: []
  },

  leave: {
    leaveTypes: [],
    policies: [],
    quotas: []
  },

  workflows: {
    approvals: [],
    sla: {}
  },

  roles_permissions: {
    roles: [],
    permissions: []
  }
};

for (const [category, config] of Object.entries(defaults)) {
  await pool.query(
    `
    INSERT INTO system_configuration
      (key, category, config_value, updated_at)
    VALUES
      ($1, $1, $2::jsonb, NOW())
    ON CONFLICT (key)
    DO NOTHING
    `,
    [category, JSON.stringify(config)]
  );
}

console.log("Configuration defaults initialized.");

await pool.end();
