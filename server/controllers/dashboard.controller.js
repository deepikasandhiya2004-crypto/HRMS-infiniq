import pool from '../db.js';
import { ALL_SCOPE_ROLES, REVIEWER_ROLES } from '../config/roles.js';
import { fetchToday } from './attendance.controller.js';
import { countPendingApprovals } from './requests.controller.js';

const TODAY_IST = `(NOW() AT TIME ZONE 'Asia/Kolkata')::date`;

function getScope(role) {
  if (ALL_SCOPE_ROLES.includes(role)) return 'organization';
  if (REVIEWER_ROLES.includes(role)) return 'team';
  return 'self';
}

async function getSummary(user, scope) {
  const seeAll = scope === 'organization';

  const [counts, pendingApprovals] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE a.status = 'present')::int AS present,
              COUNT(*) FILTER (WHERE a.status = 'wfh')::int AS wfh,
              COUNT(*) FILTER (WHERE a.status = 'leave')::int AS on_leave,
              COUNT(*) FILTER (WHERE a.status = 'absent')::int AS absent,
              COUNT(*) FILTER (WHERE a.id IS NULL)::int AS not_checked_in,
              COUNT(*) FILTER (WHERE e.joined_on >= ${TODAY_IST} - 30)::int AS new_joiners
       FROM employees e
       LEFT JOIN attendance a
         ON a.employee_id = e.id AND a.work_date = ${TODAY_IST}
       WHERE e.status = 'active'
         AND ($2::boolean OR e.manager_id = $1)`,
      [user.id, seeAll]
    ),
    countPendingApprovals(user),
  ]);

  return { ...counts.rows[0], pending_approvals: pendingApprovals };
}

export async function getDashboard(req, res) {
  const user = req.user;
  const scope = getScope(user.role);

  try {
    const [attendance, myRequests, dateRow, summary] = await Promise.all([
      fetchToday(user.id),
      pool.query(
        `SELECT COUNT(*)::int AS pending
         FROM attendance_requests
         WHERE employee_id = $1 AND status = 'pending'`,
        [user.id]
      ),
      pool.query(`SELECT ${TODAY_IST} AS today`),
      scope === 'self' ? null : getSummary(user, scope),
    ]);

    res.json({
      today: dateRow.rows[0].today,
      user: { id: user.id, full_name: user.full_name, role: user.role },
      scope,
      attendance,
      my_requests: myRequests.rows[0],
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load dashboard' });
  }
}