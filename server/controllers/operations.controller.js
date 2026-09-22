import pool from '../db.js';
import { ALL_SCOPE_ROLES, REVIEWER_ROLES } from '../config/roles.js';

// ==================== 1. EMPLOYEES ====================

export async function getEmployees(req, res) {
  const { search, department, status, role } = req.query;

  let query = `
    SELECT e.id, e.employee_code, e.full_name, e.email, e.phone, e.role,
           e.department, e.designation, e.manager_id, e.status, e.joined_on,
           e.created_at, m.full_name AS manager_name
    FROM employees e
    LEFT JOIN employees m ON m.id = e.manager_id
    WHERE 1=1
  `;
  const params = [];
  let paramIdx = 1;

  if (search) {
    query += ` AND (e.full_name ILIKE $${paramIdx} OR e.employee_code ILIKE $${paramIdx} OR e.email ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (department) {
    query += ` AND e.department = $${paramIdx++}`;
    params.push(department);
  }
  if (status) {
    query += ` AND e.status = $${paramIdx++}`;
    params.push(status);
  }
  if (role) {
    query += ` AND e.role = $${paramIdx++}`;
    params.push(role);
  }

  query += ` ORDER BY e.id ASC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ employees: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load employees' });
  }
}

export async function createEmployee(req, res) {
  const {
    employee_code,
    full_name,
    email,
    role = 'employee',
    department,
    designation,
    manager_id,
    joined_on,
    phone,
  } = req.body;

  if (!employee_code || !full_name || !email) {
    return res.status(400).json({ message: 'employee_code, full_name, and email are required' });
  }

  // Use only existing roles from 001_schema.sql
  const validRoles = ['super_admin', 'founder_admin', 'hr_manager', 'hr_executive', 'manager', 'employee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO employees (
         employee_code, full_name, email, role, department, designation,
         manager_id, joined_on, phone, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [
        employee_code.trim(),
        full_name.trim(),
        email.trim().toLowerCase(),
        role,
        department || null,
        designation || null,
        manager_id || null,
        joined_on || null,
        phone || null,
      ]
    );

    res.status(201).json({ employee: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An employee with this code or email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not create employee' });
  }
}

export async function updateEmployee(req, res) {
  const empId = parseInt(req.params.id, 10);
  if (isNaN(empId) || empId <= 0) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  const allowedFields = ['full_name', 'email', 'role', 'department', 'designation', 'manager_id', 'status', 'joined_on', 'phone'];
  const body = req.body || {};
  const updates = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      if (field === 'role') {
        const validRoles = ['super_admin', 'founder_admin', 'hr_manager', 'hr_executive', 'manager', 'employee'];
        if (!validRoles.includes(body[field])) {
          return res.status(400).json({ message: `Invalid role: ${body[field]}` });
        }
      }
      if (field === 'status' && !['active', 'inactive'].includes(body[field])) {
        return res.status(400).json({ message: 'status must be active or inactive' });
      }
      updates.push(`${field} = $${idx++}`);
      values.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  values.push(empId);

  try {
    const { rows } = await pool.query(
      `UPDATE employees
       SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Employee code or email already in use' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not update employee' });
  }
}

// ==================== 2. ONBOARDING ====================

export async function getOnboardingList(req, res) {
  const { status, department } = req.query;

  let query = `
    SELECT o.*, e.full_name AS assigned_hr_name
    FROM operations_onboarding o
    LEFT JOIN employees e ON e.id = o.assigned_to
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (status) {
    query += ` AND o.status = $${idx++}`;
    params.push(status);
  }
  if (department) {
    query += ` AND o.department = $${idx++}`;
    params.push(department);
  }

  query += ` ORDER BY o.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ onboarding: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load onboarding list' });
  }
}

export async function createOnboarding(req, res) {
  const {
    candidate_name,
    email,
    phone,
    department,
    designation,
    joining_date,
    assigned_to,
    notes,
    current_stage,
    stage_index = 1,
    progress = 0,
    status = 'pending',
    stages = [],
  } = req.body;

  if (!candidate_name || !email) {
    return res.status(400).json({ message: 'candidate_name and email are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO operations_onboarding (
         candidate_name, email, phone, department, designation,
         joining_date, assigned_to, notes, current_stage, stage_index,
         progress, status, stages
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
       RETURNING *`,
      [
        candidate_name.trim(),
        email.trim().toLowerCase(),
        phone || null,
        department || null,
        designation || null,
        joining_date || null,
        assigned_to || req.user.id,
        notes || null,
        current_stage || null,
        stage_index,
        progress,
        status,
        JSON.stringify(stages),
      ]
    );

    res.status(201).json({ onboarding: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create onboarding entry' });
  }
}

export async function updateOnboarding(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid onboarding ID' });
  }

  const { stage_index, current_stage, progress, status, stages, notes } = req.body;

  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM operations_onboarding WHERE id = $1`,
      [id]
    );
    if (!existing[0]) {
      return res.status(404).json({ message: 'Onboarding record not found' });
    }

    const current = existing[0];
    const newStageIndex = stage_index != null ? parseInt(stage_index, 10) : current.stage_index;
    const newCurrentStage = current_stage != null ? current_stage : current.current_stage;
    const newProgress = progress != null ? parseInt(progress, 10) : current.progress;
    const newStatus = status != null ? status : current.status;
    const newStages = stages != null ? JSON.stringify(stages) : JSON.stringify(current.stages);

    const { rows: updated } = await pool.query(
      `UPDATE operations_onboarding
       SET stage_index = $1, current_stage = $2, progress = $3,
           status = $4, stages = $5::jsonb, notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [newStageIndex, newCurrentStage, newProgress, newStatus, newStages, notes || null, id]
    );

    res.json({ onboarding: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update onboarding record' });
  }
}

// ==================== 3. OFFBOARDING ====================

export async function getOffboardingList(req, res) {
  const { status, department } = req.query;

  let query = `
    SELECT off.*, e.employee_code, e.full_name AS employee_name,
           e.department, e.designation, m.full_name AS manager_name
    FROM operations_offboarding off
    JOIN employees e ON e.id = off.employee_id
    LEFT JOIN employees m ON m.id = e.manager_id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (status) {
    query += ` AND off.status = $${idx++}`;
    params.push(status);
  }
  if (department) {
    query += ` AND e.department = $${idx++}`;
    params.push(department);
  }

  query += ` ORDER BY off.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ offboarding: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load offboarding list' });
  }
}

export async function createOffboarding(req, res) {
  const {
    employee_id,
    resignation_date,
    last_working_date,
    reason,
    current_stage,
    stage_index = 1,
    progress = 0,
    status = 'pending',
    clearances = {},
    stages = [],
  } = req.body;

  if (!employee_id || !resignation_date || !last_working_date) {
    return res.status(400).json({ message: 'employee_id, resignation_date, and last_working_date are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO operations_offboarding (
         employee_id, resignation_date, last_working_date, reason,
         current_stage, stage_index, progress, status, clearances, stages
       ) VALUES ($1, $2::date, $3::date, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
       RETURNING *`,
      [
        employee_id,
        resignation_date,
        last_working_date,
        reason || null,
        current_stage || null,
        stage_index,
        progress,
        status,
        JSON.stringify(clearances),
        JSON.stringify(stages),
      ]
    );

    res.status(201).json({ offboarding: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create offboarding entry' });
  }
}

export async function updateOffboarding(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid offboarding ID' });
  }

  const { stage_index, current_stage, progress, status, clearances, stages } = req.body;

  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM operations_offboarding WHERE id = $1`,
      [id]
    );
    if (!existing[0]) {
      return res.status(404).json({ message: 'Offboarding record not found' });
    }

    const current = existing[0];
    const newStageIndex = stage_index != null ? parseInt(stage_index, 10) : current.stage_index;
    const newCurrentStage = current_stage != null ? current_stage : current.current_stage;
    const newProgress = progress != null ? parseInt(progress, 10) : current.progress;
    const newStatus = status != null ? status : current.status;
    const newStages = stages != null ? JSON.stringify(stages) : JSON.stringify(current.stages);
    const newClearances = clearances != null ? JSON.stringify(clearances) : JSON.stringify(current.clearances);

    const { rows: updated } = await pool.query(
      `UPDATE operations_offboarding
       SET stage_index = $1, current_stage = $2, progress = $3,
           status = $4, stages = $5::jsonb, clearances = $6::jsonb,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [newStageIndex, newCurrentStage, newProgress, newStatus, newStages, newClearances, id]
    );

    // If marked completed, update employee status to inactive (from 001_schema.sql)
    if (newStatus === 'completed') {
      await pool.query(`UPDATE employees SET status = 'inactive' WHERE id = $1`, [current.employee_id]);
    }

    res.json({ offboarding: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update offboarding record' });
  }
}

// ==================== 4. HR SERVICES ====================

export async function getHrServices(req, res) {
  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const { status, service_type } = req.query;

  let query = `
    SELECT s.*, e.employee_code, e.full_name AS employee_name,
           e.department, e.designation, a.full_name AS assigned_to_name
    FROM operations_hr_services s
    JOIN employees e ON e.id = s.employee_id
    LEFT JOIN employees a ON a.id = s.assigned_to
    WHERE ($1::boolean OR s.employee_id = $2)
  `;
  const params = [seeAll, req.user.id];
  let idx = 3;

  if (status) {
    query += ` AND s.status = $${idx++}`;
    params.push(status);
  }
  if (service_type) {
    query += ` AND s.service_type = $${idx++}`;
    params.push(service_type);
  }

  query += ` ORDER BY s.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ services: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load HR services' });
  }
}

export async function createHrService(req, res) {
  const { service_type, priority, purpose, attachment_url, ticket_number } = req.body;

  if (!service_type || !purpose || purpose.trim().length < 5) {
    return res.status(400).json({ message: 'service_type and purpose (at least 5 characters) are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO operations_hr_services (
         ticket_number, employee_id, service_type, priority,
         status, purpose, attachment_url
       ) VALUES ($1, $2, $3, $4, 'pending', $5, $6)
       RETURNING *`,
      [ticket_number || null, req.user.id, service_type, priority || null, purpose.trim(), attachment_url || null]
    );

    res.status(201).json({ ticket: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create HR service request' });
  }
}

export async function updateHrService(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid ticket ID' });
  }

  const { status, priority, assigned_to, resolution_notes } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE operations_hr_services
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           resolution_notes = COALESCE($4, resolution_notes),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status || null, priority || null, assigned_to || null, resolution_notes || null, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'HR service ticket not found' });
    }

    res.json({ ticket: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update HR service ticket' });
  }
}

// ==================== 5. EMPLOYEE REQUESTS ====================

export async function getEmployeeRequests(req, res) {
  const seeAll = ALL_SCOPE_ROLES.includes(req.user.role);
  const isManager = req.user.role === 'manager';
  const { status, category } = req.query;

  let query = `
    SELECT r.*, e.employee_code, e.full_name AS employee_name,
           e.department, e.designation, a.full_name AS assigned_to_name
    FROM operations_employee_requests r
    JOIN employees e ON e.id = r.employee_id
    LEFT JOIN employees a ON a.id = r.assigned_to
    WHERE ($1::boolean
           OR ($2::boolean AND (e.manager_id = $3 OR r.employee_id = $3))
           OR r.employee_id = $3)
  `;
  const params = [seeAll, isManager, req.user.id];
  let idx = 4;

  if (status) {
    query += ` AND r.status = $${idx++}`;
    params.push(status);
  }
  if (category) {
    query += ` AND r.category = $${idx++}`;
    params.push(category);
  }

  query += ` ORDER BY r.created_at DESC`;

  try {
    const { rows } = await pool.query(query, params);
    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load employee requests' });
  }
}

export async function createEmployeeRequest(req, res) {
  const { category, subject, priority, description, request_number } = req.body;

  if (!category || !subject || !description || description.trim().length < 5) {
    return res.status(400).json({ message: 'category, subject, and description (at least 5 characters) are required' });
  }

  try {
    const initialThread = [
      {
        sender: req.user.full_name,
        role: req.user.role,
        time: new Date().toISOString(),
        message: description.trim(),
      },
    ];

    const { rows } = await pool.query(
      `INSERT INTO operations_employee_requests (
         request_number, employee_id, category, subject, priority,
         status, description, thread
       ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7::jsonb)
       RETURNING *`,
      [request_number || null, req.user.id, category, subject.trim(), priority || null, description.trim(), JSON.stringify(initialThread)]
    );

    res.status(201).json({ request: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not submit employee request' });
  }
}

export async function addRequestReply(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  const { message, new_status } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: 'Reply message cannot be empty' });
  }

  try {
    const { rows: reqRows } = await pool.query(
      `SELECT * FROM operations_employee_requests WHERE id = $1`,
      [id]
    );
    if (!reqRows[0]) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const current = reqRows[0];
    const newEntry = {
      sender: req.user.full_name,
      role: req.user.role,
      time: new Date().toISOString(),
      message: message.trim(),
    };

    const thread = Array.isArray(current.thread) ? [...current.thread, newEntry] : [newEntry];
    const status = new_status || current.status;

    const { rows: updated } = await pool.query(
      `UPDATE operations_employee_requests
       SET thread = $1::jsonb, status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(thread), status, id]
    );

    res.json({ request: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not post reply to request' });
  }
}

export async function updateEmployeeRequest(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  const { status, priority, assigned_to } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE operations_employee_requests
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status || null, priority || null, assigned_to || null, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ request: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update employee request' });
  }
}
