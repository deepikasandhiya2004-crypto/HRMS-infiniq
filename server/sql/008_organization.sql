CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(150),
  industry VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(30),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(80),
  state VARCHAR(80),
  country VARCHAR(80) DEFAULT 'India',
  pincode VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================
-- ORGANIZATION MASTER DATA
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(30) UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(30) UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(30) UNIQUE,
  address TEXT,
  city VARCHAR(80),
  state VARCHAR(80),
  country VARCHAR(80) DEFAULT 'India',
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(30) UNIQUE,
  description TEXT,
  manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================
-- COMPANY
-- ============================================

CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(150),
  industry VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(30),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(80),
  state VARCHAR(80),
  country VARCHAR(80) DEFAULT 'India',
  pincode VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS company (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(150),
  industry VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(30),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(80),
  state VARCHAR(80),
  country VARCHAR(80) DEFAULT 'India',
  pincode VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);