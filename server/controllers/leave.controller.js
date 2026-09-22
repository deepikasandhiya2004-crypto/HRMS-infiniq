import pool from '../db.js';
import { ALL_SCOPE_ROLES, REVIEWER_ROLES } from '../config/roles.js';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Get all active leave types
export async function getLeaveTypes(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, code, name, annual_allocation, carry_forward, max_carry_forward,
              encashment, half_day_allowed, attachment_required, approval_required, active
       FROM leave_types
       WHERE active = TRUE
       ORDER BY id`
    );
    res.json({ types: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load leave types' });
  }
}

// Get leave balances for the authenticated employee (only genuine existing records, no invented data)
export async function getLeaveBalances(req, res) {
  const currentYear = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.leave_type_id, lt.code, lt.name, b.year,
              b.allocated::float, b.used::float, b.pending::float,
              GREATEST(b.allocated - b.used - b.pending, 0)::float AS available,
              lt.half_day_allowed, lt.attachment_required
       FROM leave_balances b
       JOIN leave_types lt ON lt.id = b.leave_type_id
       WHERE b.employee_id = $1 AND b.year = $2
       ORDER BY lt.id`,
      [req.user.id, currentYear]
    );

    res.json({ year: currentYear, balances: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load leave balances' });
  }
}

// Get the authenticated employee's leave requests
export async function getMyLeaves(req, res) {
  const { status, year } = req.query;

  let query = `
    SELECT lr.id, lr.leave_type_id, lt.code AS leave_code, lt.name AS leave_type,
           lr.from_date, lr.to_date, lr.days::float, lr.half_day, lr.half_day_session,
           lr.reason, lr.attachment_url, lr.status, lr.reviewed_at, lr.review_note,
           lr.created_at, e_rev.full_name AS approver_name
    FROM leave_requests lr
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    LEFT JOIN employees e_rev ON e_rev.id = lr.reviewed_by
    WHERE lr.employee_id = $1
  `;
  const params = [req.user.id];
  let paramIdx = 2;

  if (status) {
    query += ` AND lr.status = $${paramIdx++}`;
    params.push(status);
  }
  if (year) {
    query += ` AND EXTRACT(YEAR FROM lr.from_date) = $${paramIdx++}`;
    params.push(parseInt(year, 10));
  }

  query += ` ORDER BY lr.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ leaves: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your leave records' });
  }
}

// Apply for leave
export async function applyLeave(req, res) {
  const {
    leave_type_id,
    from_date,
    to_date,
    days,
    half_day = false,
    half_day_session,
    reason,
    attachment_url,
  } = req.body;

  if (!leave_type_id || !from_date || !to_date || days == null) {
    return res.status(400).json({ message: 'leave_type_id, from_date, to_date, and days are required' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from_date) || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
    return res.status(400).json({ message: 'Dates must be in YYYY-MM-DD format' });
  }
  if (new Date(from_date) > new Date(to_date)) {
    return res.status(400).json({ message: 'from_date cannot be after to_date' });
  }
  const numDays = parseFloat(days);
  if (isNaN(numDays) || numDays <= 0) {
    return res.status(400).json({ message: 'days must be a positive number' });
  }
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ message: 'Please provide a reason (at least 5 characters)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check leave type validity
    const { rows: typeRows } = await client.query(
      `SELECT * FROM leave_types WHERE id = $1 AND active = TRUE`,
      [leave_type_id]
    );
    if (!typeRows[0]) {
      throw new HttpError(404, 'Invalid or inactive leave type');
    }
    const leaveType = typeRows[0];

    if (leaveType.attachment_required && !attachment_url) {
      throw new HttpError(400, `Attachment is required for ${leaveType.name}`);
    }

    // Check for overlapping leaves (pending or approved)
    const { rows: overlap } = await client.query(
      `SELECT id FROM leave_requests
       WHERE employee_id = $1
         AND status IN ('pending', 'approved')
         AND from_date <= $3::date AND to_date >= $2::date`,
      [req.user.id, from_date, to_date]
    );
    if (overlap.length > 0) {
      throw new HttpError(409, 'An active or pending leave request already exists for this period');
    }

    // Check leave balance if a balance row exists
    const year = parseInt(from_date.slice(0, 4), 10);
    const { rows: balRows } = await client.query(
      `SELECT allocated::float, used::float, pending::float,
              (allocated - used - pending)::float AS available
       FROM leave_balances
       WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3
       FOR UPDATE`,
      [req.user.id, leave_type_id, year]
    );

    if (balRows.length > 0 && balRows[0].available < numDays) {
      throw new HttpError(400, `Insufficient leave balance. Available: ${balRows[0].available} day(s)`);
    }

    // Insert leave request
    const { rows: reqRows } = await client.query(
      `INSERT INTO leave_requests (
         employee_id, leave_type_id, from_date, to_date, days,
         half_day, half_day_session, reason, attachment_url, status
       ) VALUES ($1, $2, $3::date, $4::date, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [
        req.user.id,
        leave_type_id,
        from_date,
        to_date,
        numDays,
        half_day,
        half_day_session || null,
        reason.trim(),
        attachment_url || null,
      ]
    );

    // Update pending balance if balance record exists
    if (balRows.length > 0) {
      await client.query(
        `UPDATE leave_balances
         SET pending = pending + $1, updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [numDays, req.user.id, leave_type_id, year]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ leave: reqRows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not submit leave request' });
  } finally {
    client.release();
  }
}

// Cancel a pending leave request
export async function cancelLeave(req, res) {
  const leaveId = parseInt(req.params.id, 10);
  if (isNaN(leaveId) || leaveId <= 0) {
    return res.status(400).json({ message: 'Invalid leave request ID' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: reqRows } = await client.query(
      `SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`,
      [leaveId]
    );
    const leave = reqRows[0];

    if (!leave) throw new HttpError(404, 'Leave request not found');
    if (leave.employee_id !== req.user.id) {
      throw new HttpError(403, 'You cannot cancel another employee’s leave request');
    }
    if (leave.status !== 'pending') {
      throw new HttpError(409, `Cannot cancel a leave with status '${leave.status}'`);
    }

    const year = new Date(leave.from_date).getFullYear();

    const { rows: updated } = await client.query(
      `UPDATE leave_requests
       SET status = 'cancelled'
       WHERE id = $1
       RETURNING *`,
      [leaveId]
    );

    // Decrement pending balance if balance record exists
    await client.query(
      `UPDATE leave_balances
       SET pending = GREATEST(pending - $1, 0), updated_at = NOW()
       WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
      [leave.days, req.user.id, leave.leave_type_id, year]
    );

    await client.query('COMMIT');
    res.json({ message: 'Leave request cancelled successfully', leave: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not cancel leave request' });
  } finally {
    client.release();
  }
}

// Get team leave requests (for managers and HR/Admins)
export async function getTeamLeaves(req, res) {
  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const { status, department } = req.query;

  let query = `
    SELECT lr.id, lr.employee_id, e.employee_code, e.full_name AS employee_name,
           e.department, e.designation, lr.leave_type_id, lt.code AS leave_code,
           lt.name AS leave_type, lr.from_date, lr.to_date, lr.days::float,
           lr.half_day, lr.half_day_session, lr.reason, lr.attachment_url,
           lr.status, lr.created_at, lr.reviewed_at, lr.review_note,
           rev.full_name AS approver_name
    FROM leave_requests lr
    JOIN employees e ON e.id = lr.employee_id
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    LEFT JOIN employees rev ON rev.id = lr.reviewed_by
    WHERE lr.employee_id <> $1
      AND ($2::boolean OR e.manager_id = $1)
  `;
  const params = [req.user.id, seeAll];
  let paramIdx = 3;

  if (status) {
    query += ` AND lr.status = $${paramIdx++}`;
    params.push(status);
  }
  if (department) {
    query += ` AND e.department = $${paramIdx++}`;
    params.push(department);
  }

  query += ` ORDER BY lr.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load team leave requests' });
  }
}

// Review (approve or reject) a team leave request
export async function reviewLeave(req, res) {
  const leaveId = parseInt(req.params.id, 10);
  if (isNaN(leaveId) || leaveId <= 0) {
    return res.status(400).json({ message: 'Invalid leave request ID' });
  }

  const { decision, review_note = '' } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'decision must be approved or rejected' });
  }
  if (decision === 'rejected' && (!review_note || review_note.trim().length < 3)) {
    return res.status(400).json({ message: 'Please give a reason for rejection (at least 3 characters)' });
  }

  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: reqRows } = await client.query(
      `SELECT lr.*, e.manager_id
       FROM leave_requests lr
       JOIN employees e ON e.id = lr.employee_id
       WHERE lr.id = $1
       FOR UPDATE OF lr`,
      [leaveId]
    );
    const leave = reqRows[0];

    if (!leave) throw new HttpError(404, 'Leave request not found');
    if (leave.status !== 'pending') {
      throw new HttpError(409, `Leave request has already been ${leave.status}`);
    }
    if (leave.employee_id === req.user.id) {
      throw new HttpError(403, 'You cannot review your own leave request');
    }
    if (!seeAll && leave.manager_id !== req.user.id) {
      throw new HttpError(403, 'This employee does not report to you');
    }

    const year = new Date(leave.from_date).getFullYear();

    // Update leave request
    const { rows: updated } = await client.query(
      `UPDATE leave_requests
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_note = $3
       WHERE id = $4
       RETURNING *`,
      [decision, req.user.id, review_note.trim() || null, leaveId]
    );

    // Update leave balance if balance record exists
    if (decision === 'approved') {
      await client.query(
        `UPDATE leave_balances
         SET pending = GREATEST(pending - $1, 0),
             used = used + $1,
             updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.days, leave.employee_id, leave.leave_type_id, year]
      );

      // Mark attendance status as 'leave' for approved dates (using existing status 'leave' in attendance table)
      await client.query(
        `INSERT INTO attendance (employee_id, work_date, status)
         SELECT $1, d::date, 'leave'
         FROM generate_series($2::date, $3::date, '1 day'::interval) d
         ON CONFLICT (employee_id, work_date)
         DO UPDATE SET status = 'leave'
         WHERE attendance.check_in IS NULL`,
        [leave.employee_id, leave.from_date, leave.to_date]
      );
    } else {
      await client.query(
        `UPDATE leave_balances
         SET pending = GREATEST(pending - $1, 0),
             updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.days, leave.employee_id, leave.leave_type_id, year]
      );
    }

    await client.query('COMMIT');
    res.json({ request: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not review leave request' });
  } finally {
    client.release();
  }
}

// Get leave calendar records for a given month
export async function getLeaveCalendar(req, res) {
  const { month } = req.query; // YYYY-MM
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: 'month must be in YYYY-MM format' });
  }

  const ym = month || new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 7);
  const startDate = `${ym}-01`;

  try {
    const { rows } = await pool.query(
      `SELECT lr.id, lr.employee_id, e.employee_code, e.full_name, e.department,
              lt.code AS leave_code, lt.name AS leave_type,
              lr.from_date, lr.to_date, lr.days::float, lr.half_day, lr.half_day_session,
              lr.status
       FROM leave_requests lr
       JOIN employees e ON e.id = lr.employee_id
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       WHERE lr.status = 'approved'
         AND lr.from_date <= ($1::date + INTERVAL '1 month' - INTERVAL '1 day')::date
         AND lr.to_date >= $1::date
       ORDER BY lr.from_date, e.full_name`,
      [startDate]
    );

    res.json({ month: ym, leaves: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load leave calendar' });
  }
}
