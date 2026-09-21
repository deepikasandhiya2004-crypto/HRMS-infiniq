import pool from '../db.js';
import { ALL_SCOPE_ROLES } from '../config/roles.js';

const TODAY_IST = `(NOW() AT TIME ZONE 'Asia/Kolkata')::date`;

export async function createRequest(req, res) {
  const { work_date, issue_type, time, reason } = req.body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date || '')) {
    return res.status(400).json({ message: 'work_date must be YYYY-MM-DD' });
  }
  if (!['missed_check_in', 'missed_check_out'].includes(issue_type)) {
    return res.status(400).json({ message: 'Invalid issue_type' });
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) {
    return res.status(400).json({ message: 'time must be HH:mm (24-hour)' });
  }
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ message: 'Please give a reason (at least 5 characters)' });
  }

  try {
    // 1. Date must not be in the future, and not older than 30 days
    const { rows: win } = await pool.query(
      `SELECT ($1::date <= ${TODAY_IST}) AS not_future,
              ($1::date >= ${TODAY_IST} - 30) AS within_window`,
      [work_date]
    );
    if (!win[0].not_future) {
      return res.status(400).json({ message: 'Cannot request for a future date' });
    }
    if (!win[0].within_window) {
      return res.status(400).json({ message: 'Requests are allowed only for the last 30 days' });
    }

    // 2. Does the request make sense for what is already recorded?
    const { rows: att } = await pool.query(
      `SELECT check_in, check_out FROM attendance
       WHERE employee_id = $1 AND work_date = $2::date`,
      [req.user.id, work_date]
    );
    const record = att[0];
    const requestedAt = new Date(`${work_date}T${time}:00+05:30`);

    if (issue_type === 'missed_check_in') {
      if (record && record.check_in) {
        return res.status(409).json({ message: 'Check-in is already recorded for that date' });
      }
      if (record && record.check_out && requestedAt >= record.check_out) {
        return res.status(400).json({ message: 'Check-in must be before the recorded check-out' });
      }
    } else {
      if (!record || !record.check_in) {
        return res.status(409).json({ message: 'No check-in found for that date' });
      }
      if (record.check_out) {
        return res.status(409).json({ message: 'Check-out is already recorded for that date' });
      }
      if (requestedAt <= record.check_in) {
        return res.status(400).json({ message: 'Check-out must be after the check-in time' });
      }
    }

    // 3. Save the request
    const { rows } = await pool.query(
      `INSERT INTO attendance_requests
         (employee_id, work_date, issue_type, requested_time, reason)
       VALUES ($1, $2::date, $3, $4::timestamptz, $5)
       RETURNING *`,
      [req.user.id, work_date, issue_type, requestedAt.toISOString(), reason.trim()]
    );
    res.status(201).json({ request: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A pending request already exists for this date' });
    }
    if (err.code === '22008' || err.code === '22007') {
      return res.status(400).json({ message: 'Invalid date' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not submit request' });
  }
}

export async function listMyRequests(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, e.full_name AS reviewer_name
       FROM attendance_requests r
       LEFT JOIN employees e ON e.id = r.reviewed_by
       WHERE r.employee_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load requests' });
  }
}


class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function listPending(req, res) {
  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  try {
    const { rows } = await pool.query(
      `SELECT r.*, e.full_name AS employee_name, e.employee_code, e.designation
       FROM attendance_requests r
       JOIN employees e ON e.id = r.employee_id
       WHERE r.status = 'pending'
         AND r.employee_id <> $1
         AND ($2::boolean OR e.manager_id = $1)
       ORDER BY r.created_at`,
      [req.user.id, seeAll]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load pending requests' });
  }
}

async function review(req, res, decision) {
  const requestId = Number(req.params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid request id' });
  }
  const note = (req.body?.note || '').trim();
  if (decision === 'rejected' && note.length < 3) {
    return res.status(400).json({ message: 'Please give a reason for rejection' });
  }

  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock this request row so two reviewers can't process it at the same time
    const { rows } = await client.query(
      `SELECT r.*, e.manager_id
       FROM attendance_requests r
       JOIN employees e ON e.id = r.employee_id
       WHERE r.id = $1
       FOR UPDATE OF r`,
      [requestId]
    );
    const request = rows[0];

    if (!request) throw new HttpError(404, 'Request not found');
    if (request.status !== 'pending') throw new HttpError(409, 'Request already reviewed');
    if (request.employee_id === req.user.id) {
      throw new HttpError(403, 'You cannot review your own request');
    }
    if (!seeAll && request.manager_id !== req.user.id) {
      throw new HttpError(403, 'This employee is not in your team');
    }

    if (decision === 'approved') {
      let result;
      if (request.issue_type === 'missed_check_out') {
        result = await client.query(
          `UPDATE attendance SET check_out = $3
           WHERE employee_id = $1 AND work_date = $2
             AND check_in IS NOT NULL AND check_out IS NULL AND check_in < $3`,
          [request.employee_id, request.work_date, request.requested_time]
        );
      } else {
        result = await client.query(
          `INSERT INTO attendance (employee_id, work_date, check_in, status)
           VALUES ($1, $2, $3, 'present')
           ON CONFLICT (employee_id, work_date) DO UPDATE
             SET check_in = EXCLUDED.check_in, status = 'present'
             WHERE attendance.check_in IS NULL
               AND (attendance.check_out IS NULL
                    OR attendance.check_out > EXCLUDED.check_in)`,
          [request.employee_id, request.work_date, request.requested_time]
        );
      }
      if (result.rowCount === 0) {
        throw new HttpError(409, 'Attendance has changed since the request. It cannot be applied.');
      }
    }

    const { rows: updated } = await client.query(
      `UPDATE attendance_requests
       SET status = $2, reviewed_by = $3, reviewed_at = NOW(), review_note = $4
       WHERE id = $1
       RETURNING *`,
      [requestId, decision, req.user.id, note || null]
    );

    await client.query('COMMIT');
    res.json({ request: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not review request' });
  } finally {
    client.release();
  }
}

export const approveRequest = (req, res) => review(req, res, 'approved');
export const rejectRequest = (req, res) => review(req, res, 'rejected');

export async function countPendingApprovals(user) {
  const seeAll = ALL_SCOPE_ROLES.includes(user.role);
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM attendance_requests r
     JOIN employees e ON e.id = r.employee_id
     WHERE r.status = 'pending'
       AND r.employee_id <> $1
       AND ($2::boolean OR e.manager_id = $1)`,
    [user.id, seeAll]
  );
  return rows[0].count;
}