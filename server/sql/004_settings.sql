ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

CREATE TABLE IF NOT EXISTS employee_settings (
  employee_id        INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  theme              VARCHAR(10) NOT NULL DEFAULT 'system'
                     CHECK (theme IN ('light','dark','system')),
  email_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  request_updates    BOOLEAN NOT NULL DEFAULT TRUE,
  approval_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);