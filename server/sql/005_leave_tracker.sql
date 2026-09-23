-- Migration 005: Leave Tracker Tables

CREATE TABLE IF NOT EXISTS leave_types (
  id                  SERIAL PRIMARY KEY,
  code                VARCHAR(20) UNIQUE NOT NULL,
  name                VARCHAR(80) NOT NULL,
  annual_allocation   NUMERIC(4,1) NOT NULL DEFAULT 0,
  carry_forward       BOOLEAN NOT NULL DEFAULT FALSE,
  max_carry_forward   NUMERIC(4,1) NOT NULL DEFAULT 0,
  encashment          BOOLEAN NOT NULL DEFAULT FALSE,
  half_day_allowed    BOOLEAN NOT NULL DEFAULT TRUE,
  attachment_required BOOLEAN NOT NULL DEFAULT FALSE,
  approval_required   BOOLEAN NOT NULL DEFAULT TRUE,
  active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id            SERIAL PRIMARY KEY,
  employee_id   INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  allocated     NUMERIC(4,1) NOT NULL DEFAULT 0,
  used          NUMERIC(4,1) NOT NULL DEFAULT 0,
  pending       NUMERIC(4,1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id               SERIAL PRIMARY KEY,
  employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id    INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  from_date        DATE NOT NULL,
  to_date          DATE NOT NULL,
  days             NUMERIC(4,1) NOT NULL,
  half_day         BOOLEAN NOT NULL DEFAULT FALSE,
  half_day_session VARCHAR(50),
  reason           TEXT NOT NULL,
  attachment_url   TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by      INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  review_note      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_emp
  ON leave_requests (employee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leave_requests_dates
  ON leave_requests (from_date, to_date, status);INSERT INTO leave_types
  (code, name, annual_allocation, carry_forward, max_carry_forward,
   encashment, half_day_allowed, attachment_required, approval_required, active)
VALUES
  ('CL', 'Casual Leave', 0, FALSE, 0, FALSE, TRUE, FALSE, TRUE, TRUE),
  ('SL', 'Sick Leave', 0, FALSE, 0, FALSE, TRUE, TRUE, TRUE, TRUE),
  ('EL', 'Earned Leave', 0, TRUE, 30, TRUE, TRUE, FALSE, TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;
