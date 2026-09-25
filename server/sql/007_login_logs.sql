CREATE TABLE IF NOT EXISTS login_logs (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_employee ON login_logs (employee_id, logged_in_at DESC);