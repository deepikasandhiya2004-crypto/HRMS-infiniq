CREATE TABLE IF NOT EXISTS employees (
  id            SERIAL PRIMARY KEY,
  employee_code VARCHAR(20)  UNIQUE NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  role          VARCHAR(30)  NOT NULL DEFAULT 'employee'
                CHECK (role IN ('super_admin','founder_admin','hr_manager','hr_executive','manager','employee')),
  department    VARCHAR(80),
  designation   VARCHAR(80),
  manager_id    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','inactive')),
  joined_on     DATE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date   DATE    NOT NULL,
  check_in    TIMESTAMPTZ,
  check_out   TIMESTAMPTZ,
  status      VARCHAR(20) NOT NULL DEFAULT 'present'
              CHECK (status IN ('present','absent','leave','wfh')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS attendance_breaks (
  id            SERIAL PRIMARY KEY,
  attendance_id INTEGER NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  break_start   TIMESTAMPTZ NOT NULL,
  break_end     TIMESTAMPTZ
);