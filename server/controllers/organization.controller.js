import pool from "../db.js";

// ==================== DEPARTMENTS ====================

export async function getDepartments(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        d.id,
        d.name,
        d.code,
        d.description,
        d.status,
        d.created_at,
        d.updated_at,
        e.full_name AS manager_name
      FROM departments d
      LEFT JOIN employees e
        ON e.department = d.name
        AND e.role IN ('manager', 'hr_manager', 'founder_admin', 'super_admin')
      ORDER BY d.name ASC
    `);

    res.json({
      departments: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET DEPARTMENTS ERROR:", error);
    res.status(500).json({
      message: "Could not load departments",
    });
  }
}

export async function createDepartment(req, res) {
  const { name, code, description, manager } = req.body;

  if (!name?.trim() || !code?.trim()) {
    return res.status(400).json({
      message: "Department name and code are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO departments
        (name, code, description)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [
        name.trim(),
        code.trim().toUpperCase(),
        description?.trim() || null,
      ]
    );

    res.status(201).json({
      department: rows[0],
    });
  } catch (error) {
    console.error("CREATE DEPARTMENT ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Department name or code already exists",
      });
    }

    res.status(500).json({
      message: "Could not create department",
    });
  }
}
// ==================== DESIGNATIONS ====================

export async function getDesignations(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        code,
        description,
        status,
        created_at,
        updated_at
      FROM designations
      ORDER BY name ASC
    `);

    res.json({
      designations: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET DESIGNATIONS ERROR:", error);

    res.status(500).json({
      message: "Could not load designations",
    });
  }
}

export async function createDesignation(req, res) {
  const { name, code, description } = req.body;

  if (!name?.trim() || !code?.trim()) {
    return res.status(400).json({
      message: "Designation name and code are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO designations
        (name, code, description)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [
        name.trim(),
        code.trim().toUpperCase(),
        description?.trim() || null,
      ]
    );

    res.status(201).json({
      designation: rows[0],
    });
  } catch (error) {
    console.error("CREATE DESIGNATION ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Designation name or code already exists",
      });
    }

    res.status(500).json({
      message: "Could not create designation",
    });
  }
}
// ==================== LOCATIONS ====================

export async function getLocations(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        code,
        address,
        city,
        state,
        country,
        status,
        created_at,
        updated_at
      FROM locations
      ORDER BY name ASC
    `);

    res.json({
      locations: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET LOCATIONS ERROR:", error);

    res.status(500).json({
      message: "Could not load locations",
    });
  }
}

export async function createLocation(req, res) {
  const {
    name,
    code,
    address,
    city,
    state,
    country,
  } = req.body;

  if (!name?.trim() || !code?.trim() || !city?.trim()) {
    return res.status(400).json({
      message: "Location name, code and city are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO locations
        (name, code, address, city, state, country)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name.trim(),
        code.trim().toUpperCase(),
        address?.trim() || null,
        city.trim(),
        state?.trim() || null,
        country?.trim() || "India",
      ]
    );

    res.status(201).json({
      location: rows[0],
    });
  } catch (error) {
    console.error("CREATE LOCATION ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Location name or code already exists",
      });
    }

    res.status(500).json({
      message: "Could not create location",
    });
  }
}
// ==================== TEAMS ====================

export async function getTeams(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.code,
        t.description,
        t.manager_id,
        t.department_id,
        t.status,
        t.created_at,
        t.updated_at,
        d.name AS department_name,
        e.full_name AS manager_name
      FROM teams t
      LEFT JOIN departments d
        ON d.id = t.department_id
      LEFT JOIN employees e
        ON e.id = t.manager_id
      ORDER BY t.name ASC
    `);

    res.json({
      teams: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET TEAMS ERROR:", error);

    res.status(500).json({
      message: "Could not load teams",
    });
  }
}

export async function createTeam(req, res) {
  const {
    name,
    code,
    description,
    manager_id,
    department_id,
  } = req.body;

  if (!name?.trim() || !code?.trim()) {
    return res.status(400).json({
      message: "Team name and code are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO teams
        (
          name,
          code,
          description,
          manager_id,
          department_id
        )
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        name.trim(),
        code.trim().toUpperCase(),
        description?.trim() || null,
        manager_id || null,
        department_id || null,
      ]
    );

    res.status(201).json({
      team: rows[0],
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Team name or code already exists",
      });
    }

    res.status(500).json({
      message: "Could not create team",
    });
  }
}
// ==================== COMPANY ====================

export async function getCompany(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        legal_name,
        industry,
        email,
        phone,
        website,
        address,
        city,
        state,
        country,
        pincode,
        created_at,
        updated_at
      FROM company
      ORDER BY id ASC
      LIMIT 1
    `);

    res.json({
      company: rows[0] || null,
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);

    res.status(500).json({
      message: "Could not load company",
    });
  }
}

export async function saveCompany(req, res) {
  const {
    name,
    legalName,
    industry,
    email,
    phone,
    website,
    address,
    city,
    state,
    country,
    pincode,
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Company name is required",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO company
        (
          name,
          legal_name,
          industry,
          email,
          phone,
          website,
          address,
          city,
          state,
          country,
          pincode
        )
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        legal_name = EXCLUDED.legal_name,
        industry = EXCLUDED.industry,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        pincode = EXCLUDED.pincode,
        updated_at = NOW()
      RETURNING *
      `,
      [
        name.trim(),
        legalName?.trim() || null,
        industry?.trim() || null,
        email?.trim() || null,
        phone?.trim() || null,
        website?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        country?.trim() || "India",
        pincode?.trim() || null,
      ]
    );

    res.json({
      message: "Company details saved successfully",
      company: rows[0],
    });
  } catch (error) {
    console.error("SAVE COMPANY ERROR:", error);

    res.status(500).json({
      message: "Could not save company",
    });
  }
}
// ==================== ORGANIZATION STRUCTURE ====================

export async function getOrgStructure(req, res) {
  try {
    const [departmentsResult, teamsResult, designationsResult] =
      await Promise.all([
        pool.query(`
          SELECT
            id,
            name,
            code,
            description,
            status
          FROM departments
          ORDER BY name ASC
        `),

        pool.query(`
          SELECT
            t.id,
            t.name,
            t.code,
            t.description,
            t.manager_id,
            t.department_id,
            t.status,
            d.name AS department_name,
            e.full_name AS manager_name
          FROM teams t
          LEFT JOIN departments d
            ON d.id = t.department_id
          LEFT JOIN employees e
            ON e.id = t.manager_id
          ORDER BY t.name ASC
        `),

        pool.query(`
          SELECT
            id,
            name,
            code,
            description,
            status
          FROM designations
          ORDER BY name ASC
        `),
      ]);

    res.json({
      departments: departmentsResult.rows,
      teams: teamsResult.rows,
      designations: designationsResult.rows,
    });
  } catch (error) {
    console.error("GET ORGANIZATION STRUCTURE ERROR:", error);

    res.status(500).json({
      message: "Could not load organization structure",
    });
  }
}