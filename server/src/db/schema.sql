-- Cyberwar Banking Defense - PostgreSQL Schema
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS banking_assets (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(64) NOT NULL,
  criticality VARCHAR(32) NOT NULL,
  vulnerability_level INT NOT NULL CHECK (vulnerability_level BETWEEN 0 AND 100),
  operational_status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
  health_score INT NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  ip_subnet VARCHAR(128) NOT NULL,
  tier VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  dependencies JSONB NOT NULL DEFAULT '[]',
  dependents JSONB NOT NULL DEFAULT '[]',
  applied_controls JSONB NOT NULL DEFAULT '[]',
  financial_exposure_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  rto_hours NUMERIC(6, 2) NOT NULL DEFAULT 1,
  rpo_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS defensive_controls (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  cost_usd NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  eligible_asset_types JSONB NOT NULL DEFAULT '[]',
  effectiveness JSONB NOT NULL,
  limitations TEXT NOT NULL,
  operational_overhead TEXT NOT NULL,
  mitigation_formula TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simulation_sessions (
  id VARCHAR(128) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_budget_usd NUMERIC(15, 2) NOT NULL,
  spent_budget_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_round INT NOT NULL DEFAULT 1,
  overall_risk_score NUMERIC(5, 2) NOT NULL DEFAULT 75,
  operational_health INT NOT NULL DEFAULT 100,
  business_continuity_status VARCHAR(64) NOT NULL DEFAULT 'NORMAL',
  active_role VARCHAR(64) NOT NULL DEFAULT 'CISO'
);

CREATE TABLE IF NOT EXISTS simulation_rounds (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(128) REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  scenario_id VARCHAR(128) NOT NULL,
  scenario_name VARCHAR(255) NOT NULL,
  vector VARCHAR(64) NOT NULL,
  initial_risk NUMERIC(5, 2) NOT NULL,
  residual_risk NUMERIC(5, 2) NOT NULL,
  budget_allocated_usd NUMERIC(15, 2) NOT NULL,
  operational_health_end INT NOT NULL,
  financial_damage_usd NUMERIC(15, 2) NOT NULL,
  events_count INT NOT NULL DEFAULT 0,
  defenses_effective_count INT NOT NULL DEFAULT 0,
  defenses_bypassed_count INT NOT NULL DEFAULT 0,
  ir_score INT NOT NULL DEFAULT 0,
  key_takeaway TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simulation_events (
  id VARCHAR(128) PRIMARY KEY,
  session_id VARCHAR(128) REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  step INT NOT NULL,
  scenario_id VARCHAR(128) NOT NULL,
  target_asset_id VARCHAR(64) REFERENCES banking_assets(id) ON DELETE SET NULL,
  severity VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  defenses_evaluated JSONB NOT NULL DEFAULT '[]',
  mitigation_succeeded BOOLEAN NOT NULL,
  total_mitigation_rate NUMERIC(4, 2) NOT NULL,
  resulting_status VARCHAR(32) NOT NULL,
  health_delta INT NOT NULL,
  financial_impact_usd NUMERIC(15, 2) NOT NULL,
  lessons_learned TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ir_decisions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(128) REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  stage_number INT NOT NULL,
  stage_name VARCHAR(128) NOT NULL,
  chosen_option_id VARCHAR(128) NOT NULL,
  points_awarded INT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
