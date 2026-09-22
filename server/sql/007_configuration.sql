-- Migration 007: System Configuration Table

CREATE TABLE IF NOT EXISTS system_configuration (
  key          VARCHAR(50) PRIMARY KEY,
  category     VARCHAR(50) NOT NULL,
  config_value JSONB NOT NULL,
  updated_by   INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
