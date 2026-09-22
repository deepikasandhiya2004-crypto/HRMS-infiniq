-- Migration 006: Operations Tables

CREATE TABLE IF NOT EXISTS operations_onboarding (
  id             SERIAL PRIMARY KEY,
  candidate_name VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  phone          VARCHAR(20),
  department     VARCHAR(80),
  designation    VARCHAR(80),
  joining_date   DATE,
  current_stage  VARCHAR(100),
  stage_index    INTEGER NOT NULL DEFAULT 1,
  progress       INTEGER NOT NULL DEFAULT 0,
  assigned_to    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  status         VARCHAR(30) NOT NULL DEFAULT 'pending',
  stages         JSONB NOT NULL DEFAULT '[]',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_offboarding (
  id                 SERIAL PRIMARY KEY,
  employee_id        INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  resignation_date   DATE NOT NULL,
  last_working_date  DATE NOT NULL,
  reason             TEXT,
  current_stage      VARCHAR(100),
  stage_index        INTEGER NOT NULL DEFAULT 1,
  progress           INTEGER NOT NULL DEFAULT 0,
  status             VARCHAR(30) NOT NULL DEFAULT 'pending',
  clearances         JSONB NOT NULL DEFAULT '{}',
  stages             JSONB NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_hr_services (
  id               SERIAL PRIMARY KEY,
  ticket_number    VARCHAR(50),
  employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  service_type     VARCHAR(80) NOT NULL,
  priority         VARCHAR(30),
  status           VARCHAR(30) NOT NULL DEFAULT 'pending',
  purpose          TEXT NOT NULL,
  attachment_url   TEXT,
  assigned_to      INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_employee_requests (
  id             SERIAL PRIMARY KEY,
  request_number VARCHAR(50),
  employee_id    INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  category       VARCHAR(80) NOT NULL,
  subject        VARCHAR(200) NOT NULL,
  priority       VARCHAR(30),
  status         VARCHAR(30) NOT NULL DEFAULT 'pending',
  description    TEXT NOT NULL,
  assigned_to    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  thread         JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_onboarding_status ON operations_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_ops_offboarding_emp ON operations_offboarding(employee_id);
CREATE INDEX IF NOT EXISTS idx_ops_hr_services_emp ON operations_hr_services(employee_id);
CREATE INDEX IF NOT EXISTS idx_ops_emp_requests_emp ON operations_employee_requests(employee_id);
