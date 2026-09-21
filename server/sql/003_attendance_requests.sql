CREATE TABLE IF NOT EXISTS attendance_requests (
  id             SERIAL PRIMARY KEY,
  employee_id    INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date      DATE NOT NULL,
  issue_type     VARCHAR(20) NOT NULL
                 CHECK (issue_type IN ('missed_check_in','missed_check_out')),
  requested_time TIMESTAMPTZ NOT NULL,
  reason         TEXT NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  reviewed_by    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  review_note    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_request_per_day_and_type
  ON attendance_requests (employee_id, work_date, issue_type)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_attendance_requests_employee
  ON attendance_requests (employee_id, created_at DESC);