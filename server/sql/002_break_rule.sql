CREATE UNIQUE INDEX IF NOT EXISTS one_open_break_per_attendance
  ON attendance_breaks (attendance_id)
  WHERE break_end IS NULL;