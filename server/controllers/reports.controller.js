import pool from "../db.js";
import { ALL_SCOPE_ROLES, REVIEWER_ROLES } from "../config/roles.js";

function getScope(role) {
  if (ALL_SCOPE_ROLES.includes(role)) {
    return "organization";
  }

  if (REVIEWER_ROLES.includes(role)) {
    return "team";
  }

  return "self";
}

function getDateRange(range) {
  switch (range) {
    case "Last Month":
      return {
        start:
          "date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date",
        end:
          "date_trunc('month', CURRENT_DATE)::date",
      };

    case "Last 3 Months":
      return {
        start:
          "(CURRENT_DATE - INTERVAL '3 months')::date",
        end:
          "CURRENT_DATE + 1",
      };

    case "This Year":
      return {
        start:
          "date_trunc('year', CURRENT_DATE)::date",
        end:
          "CURRENT_DATE + 1",
      };

    default:
      return {
        start:
          "date_trunc('month', CURRENT_DATE)::date",
        end:
          "CURRENT_DATE + 1",
      };
  }
}


/* ================================================= */
/* ATTENDANCE REPORT */
/* ================================================= */

export async function getAttendanceReport(req, res) {
  const user = req.user;
  const scope = getScope(user.role);
  const range = req.query.range || "This Month";
  const dates = getDateRange(range);

  try {
    let employeeCondition = "";
    const params = [];

    if (scope === "self") {
      params.push(user.id);

      employeeCondition = `
        AND e.id = $${params.length}
      `;
    }

    if (scope === "team") {
      params.push(user.id);

      employeeCondition = `
        AND e.manager_id = $${params.length}
      `;
    }

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.employee_code,
        e.full_name,
        e.department,
        e.designation,

        COUNT(a.id)::int AS total_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'present'
        )::int AS present_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'absent'
        )::int AS absent_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'leave'
        )::int AS leave_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'wfh'
        )::int AS wfh_days

      FROM employees e

      LEFT JOIN attendance a
        ON a.employee_id = e.id
        AND a.work_date >= ${dates.start}
        AND a.work_date < ${dates.end}

      WHERE e.status = 'active'

      ${employeeCondition}

      GROUP BY
        e.id,
        e.employee_code,
        e.full_name,
        e.department,
        e.designation

      ORDER BY e.full_name
      `,
      params
    );

    res.json({
      scope,
      range,
      data: result.rows,
    });
  } catch (err) {
    console.error("Attendance report error:", err);

    res.status(500).json({
      message: "Could not load attendance report",
    });
  }
}


/* ================================================= */
/* LEAVE REPORT */
/* ================================================= */

export async function getLeaveReport(req, res) {
  const user = req.user;
  const scope = getScope(user.role);

  try {
    let employeeCondition = "";
    const params = [];

    if (scope === "self") {
      params.push(user.id);

      employeeCondition = `
        AND e.id = $${params.length}
      `;
    }

    if (scope === "team") {
      params.push(user.id);

      employeeCondition = `
        AND e.manager_id = $${params.length}
      `;
    }

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.employee_code,
        e.full_name,
        e.department,

        COUNT(lr.id)::int AS total_requests,

        COUNT(lr.id) FILTER (
          WHERE lr.status = 'approved'
        )::int AS approved,

        COUNT(lr.id) FILTER (
          WHERE lr.status = 'pending'
        )::int AS pending,

        COUNT(lr.id) FILTER (
          WHERE lr.status = 'rejected'
        )::int AS rejected,

        COALESCE(
          SUM(lr.days) FILTER (
            WHERE lr.status = 'approved'
          ),
          0
        ) AS approved_days

      FROM employees e

      LEFT JOIN leave_requests lr
        ON lr.employee_id = e.id

      WHERE e.status = 'active'

      ${employeeCondition}

      GROUP BY
        e.id,
        e.employee_code,
        e.full_name,
        e.department

      ORDER BY e.full_name
      `,
      params
    );

    res.json({
      scope,
      data: result.rows,
    });
  } catch (err) {
    console.error("Leave report error:", err);

    res.status(500).json({
      message: "Could not load leave report",
    });
  }
}


/* ================================================= */
/* EMPLOYEE REPORT */
/* ================================================= */

export async function getEmployeeReport(req, res) {
  const user = req.user;
  const scope = getScope(user.role);

  try {
    let employeeCondition = "";
    const params = [];

    if (scope === "self") {
      params.push(user.id);

      employeeCondition = `
        AND e.id = $${params.length}
      `;
    }

    if (scope === "team") {
      params.push(user.id);

      employeeCondition = `
        AND e.manager_id = $${params.length}
      `;
    }

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.employee_code,
        e.full_name,
        e.email,
        e.department,
        e.designation,
        e.role,
        e.status,
        e.joined_on,
        e.created_at

      FROM employees e

      WHERE e.status = 'active'

      ${employeeCondition}

      ORDER BY e.full_name
      `,
      params
    );

    res.json({
      scope,
      data: result.rows,
    });
  } catch (err) {
    console.error("Employee report error:", err);

    res.status(500).json({
      message: "Could not load employee report",
    });
  }
}
export async function getPerformanceReport(req, res) {
  const user = req.user;
  const scope = getScope(user.role);
  const range = req.query.range || "This Month";
  const dates = getDateRange(range);

  try {
    let employeeCondition = "";
    const params = [];

    if (scope === "self") {
      params.push(user.id);
      employeeCondition = `AND e.id = $${params.length}`;
    }

    if (scope === "team") {
      params.push(user.id);
      employeeCondition = `AND e.manager_id = $${params.length}`;
    }

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.employee_code,
        e.full_name,
        e.department,
        e.designation,

        COUNT(a.id)::int AS total_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'present'
        )::int AS present_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'leave'
        )::int AS leave_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'wfh'
        )::int AS wfh_days,

        COUNT(a.id) FILTER (
          WHERE a.status = 'absent'
        )::int AS absent_days,

        ROUND(
          COALESCE(
            AVG(
              EXTRACT(
                EPOCH FROM (a.check_out - a.check_in)
              ) / 3600
            ) FILTER (
              WHERE a.check_in IS NOT NULL
                AND a.check_out IS NOT NULL
            ),
            0
          )::numeric,
          2
        ) AS average_working_hours

      FROM employees e

      LEFT JOIN attendance a
        ON a.employee_id = e.id
        AND a.work_date >= ${dates.start}
        AND a.work_date < ${dates.end}

      WHERE e.status = 'active'
      ${employeeCondition}

      GROUP BY
        e.id,
        e.employee_code,
        e.full_name,
        e.department,
        e.designation

      ORDER BY e.full_name
      `,
      params
    );

    const data = result.rows.map((employee) => {
      const totalDays = Number(employee.total_days);
      const presentDays = Number(employee.present_days);
      const wfhDays = Number(employee.wfh_days);
      const leaveDays = Number(employee.leave_days);

      const workingDays = presentDays + wfhDays;

      const attendanceRate =
        totalDays > 0
          ? Number(((workingDays / totalDays) * 100).toFixed(2))
          : 0;

      return {
        ...employee,
        total_days: totalDays,
        present_days: presentDays,
        leave_days: leaveDays,
        wfh_days: wfhDays,
        absent_days: Number(employee.absent_days),
        average_working_hours: Number(
          employee.average_working_hours
        ),
        attendance_rate: attendanceRate,
      };
    });

    res.json({
      scope,
      range,
      data,
    });
  } catch (err) {
    console.error("Performance report error:", err);

    res.status(500).json({
      message: "Could not load performance report",
    });
  }
}