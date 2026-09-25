import pool from '../db.js';
import { ALL_SCOPE_ROLES } from '../config/roles.js';

// Company date in India time. Neon runs in UTC, so plain CURRENT_DATE
// would give the wrong date for early-morning check-ins.
const TODAY_IST = `(NOW() AT TIME ZONE 'Asia/Kolkata')::date`;

export async function fetchToday(userId) {
  const { rows } = await pool.query(
    `SELECT t.*, GREATEST(t.elapsed_seconds - t.break_seconds, 0) AS work_seconds
     FROM (
       SELECT a.*,
         EXTRACT(EPOCH FROM (COALESCE(a.check_out, NOW()) - a.check_in))::int AS elapsed_seconds,
         COALESCE((
           SELECT SUM(EXTRACT(EPOCH FROM (COALESCE(b.break_end, NOW()) - b.break_start)))
           FROM attendance_breaks b WHERE b.attendance_id = a.id
         ), 0)::int AS break_seconds,
         EXISTS (
           SELECT 1 FROM attendance_breaks b
           WHERE b.attendance_id = a.id AND b.break_end IS NULL
         ) AS on_break
       FROM attendance a
       WHERE a.employee_id = $1 AND a.work_date = ${TODAY_IST}
     ) t`,
    [userId]
  );
  return rows[0] || null;
}

export async function getToday(req, res) {
  try {
    res.json({ attendance: await fetchToday(req.user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load today attendance' });
  }
}

export async function checkIn(req, res) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO attendance (employee_id, work_date, check_in, status)
       VALUES ($1, ${TODAY_IST}, NOW(), 'present')
       ON CONFLICT (employee_id, work_date) DO NOTHING
       RETURNING *`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ message: 'Attendance already recorded for today' });
    }
    res.status(201).json({ attendance: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Check-in failed' });
  }
}

export async function checkOut(req, res) {
  try {
    const { rows } = await pool.query(
      `WITH closed_break AS (
         UPDATE attendance_breaks b SET break_end = NOW()
         FROM attendance a
         WHERE b.attendance_id = a.id
           AND a.employee_id = $1
           AND a.work_date = ${TODAY_IST}
           AND b.break_end IS NULL
       )
       UPDATE attendance SET check_out = NOW()
       WHERE employee_id = $1
         AND work_date = ${TODAY_IST}
         AND check_in IS NOT NULL
         AND check_out IS NULL
       RETURNING *`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ message: 'No active check-in found for today' });
    }
    res.json({ attendance: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Check-out failed' });
  }
}

export async function startBreak(req, res) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO attendance_breaks (attendance_id, break_start)
       SELECT a.id, NOW()
       FROM attendance a
       WHERE a.employee_id = $1
         AND a.work_date = ${TODAY_IST}
         AND a.check_in IS NOT NULL
         AND a.check_out IS NULL
       RETURNING *`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ message: 'You must be checked in to start a break' });
    }
    res.status(201).json({ break: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A break is already in progress' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not start break' });
  }
}

export async function endBreak(req, res) {
  try {
    const { rows } = await pool.query(
      `UPDATE attendance_breaks b SET break_end = NOW()
       FROM attendance a
       WHERE b.attendance_id = a.id
         AND a.employee_id = $1
         AND a.work_date = ${TODAY_IST}
         AND b.break_end IS NULL
       RETURNING b.*`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ message: 'No break in progress' });
    }
    res.json({ break: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not end break' });
  }
}

export async function getHistory(req, res) {
  const { month } = req.query; // 'YYYY-MM'

  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: 'month must be in YYYY-MM format' });
  }

  // Default = current month in India time
  const ym =
    month ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 7);

  try {
    const { rows } = await pool.query(
      `SELECT t.*, GREATEST(t.elapsed_seconds - t.break_seconds, 0) AS work_seconds
       FROM (
         SELECT a.id, a.work_date, a.check_in, a.check_out, a.status,
           (a.check_in IS NOT NULL AND a.check_out IS NULL
             AND a.work_date < ${TODAY_IST}) AS missed_checkout,
           CASE
             WHEN a.check_in IS NULL THEN 0
             WHEN a.check_out IS NOT NULL
               THEN EXTRACT(EPOCH FROM (a.check_out - a.check_in))::int
             WHEN a.work_date = ${TODAY_IST}
               THEN EXTRACT(EPOCH FROM (NOW() - a.check_in))::int
             ELSE 0
           END AS elapsed_seconds,
           COALESCE((
             SELECT SUM(EXTRACT(EPOCH FROM (
               COALESCE(b.break_end,
                 CASE WHEN a.work_date = ${TODAY_IST} THEN NOW() ELSE b.break_start END)
               - b.break_start)))
             FROM attendance_breaks b WHERE b.attendance_id = a.id
           ), 0)::int AS break_seconds
         FROM attendance a
         WHERE a.employee_id = $1
           AND a.work_date >= $2::date
           AND a.work_date < ($2::date + INTERVAL '1 month')
       ) t
       ORDER BY t.work_date`,
      [req.user.id, `${ym}-01`]
    );

    const summary = {
      present_days: rows.filter((r) => r.status === 'present').length,
      wfh_days: rows.filter((r) => r.status === 'wfh').length,
      leave_days: rows.filter((r) => r.status === 'leave').length,
      missed_checkouts: rows.filter((r) => r.missed_checkout).length,
      total_work_seconds: rows.reduce((sum, r) => sum + r.work_seconds, 0),
    };

    res.json({ month: ym, records: rows, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load attendance history' });
  }
}

export async function getTeamAttendance(req, res) {
  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const month = req.query.month;
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: 'month must be in YYYY-MM format' });
  }
  const ym = month || new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 7);

  try {
    const { rows: members } = await pool.query(
      `SELECT e.id, e.full_name, e.employee_code, e.designation,
              COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present_days,
              COUNT(a.id) FILTER (WHERE a.status = 'wfh')::int AS wfh_days,
              COUNT(a.id) FILTER (WHERE a.status = 'leave')::int AS leave_days,
              COUNT(a.id) FILTER (
                WHERE a.check_in IS NOT NULL AND a.check_out IS NULL AND a.work_date < ${TODAY_IST}
              )::int AS missed_checkouts,
              COALESCE(SUM(
                CASE WHEN a.check_out IS NOT NULL
                  THEN EXTRACT(EPOCH FROM (a.check_out - a.check_in))
                  ELSE 0 END
              ), 0)::int AS total_work_seconds
       FROM employees e
       LEFT JOIN attendance a
         ON a.employee_id = e.id
         AND a.work_date >= $2::date
         AND a.work_date < ($2::date + INTERVAL '1 month')
       WHERE e.status = 'active'
         AND e.id <> $1
         AND ($3::boolean OR e.manager_id = $1)
       GROUP BY e.id, e.full_name, e.employee_code, e.designation
       ORDER BY e.full_name`,
      [req.user.id, `${ym}-01`, seeAll]
    );

    const { rows: daily } = await pool.query(
      `SELECT a.work_date,
              COUNT(*) FILTER (WHERE a.status = 'present')::int AS present,
              COUNT(*) FILTER (WHERE a.status = 'wfh')::int AS wfh,
              COUNT(*) FILTER (WHERE a.status = 'leave')::int AS leave
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.work_date >= $2::date
         AND a.work_date < ($2::date + INTERVAL '1 month')
         AND e.status = 'active'
         AND e.id <> $1
         AND ($3::boolean OR e.manager_id = $1)
       GROUP BY a.work_date
       ORDER BY a.work_date`,
      [req.user.id, `${ym}-01`, seeAll]
    );

    res.json({ month: ym, members, daily });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load team attendance' });
  }
}