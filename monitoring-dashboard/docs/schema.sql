-- ============================================================
-- Dashboard Monitoring — TimescaleDB Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================
-- 1. METRICS (Hypertable)
-- ============================================================

CREATE TABLE metrics (
  time        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category    VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  value       DOUBLE PRECISION NOT NULL,
  tags        JSONB DEFAULT '{}',
  unit        VARCHAR(20)
);

-- Convert to hypertable — auto-partition per 1 hour
SELECT create_hypertable('metrics', 'time',
  chunk_time_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_category_time ON metrics (category, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name_time ON metrics (name, time DESC);

-- ============================================================
-- 2. CONTINUOUS AGGREGATES (auto-rollup)
-- ============================================================

-- 1-minute rollup
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_1min
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS bucket,
  category,
  name,
  AVG(value) AS avg_value,
  MIN(value) AS min_value,
  MAX(value) AS max_value,
  COUNT(*)   AS sample_count
FROM metrics
GROUP BY bucket, category, name;

-- 1-hour rollup
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_1hour
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  category,
  name,
  AVG(value) AS avg_value,
  MIN(value) AS min_value,
  MAX(value) AS max_value,
  COUNT(*)   AS sample_count
FROM metrics
GROUP BY bucket, category, name;

-- ============================================================
-- 3. RETENTION & COMPRESSION POLICIES
-- ============================================================

-- Auto-drop raw data older than 2 hours
SELECT add_retention_policy('metrics', INTERVAL '2 hours', if_not_exists => TRUE);

-- Auto-compress chunks older than 1 hour
SELECT add_compression_policy('metrics', INTERVAL '1 hour', if_not_exists => TRUE);

-- Retention for rollups (optional — keep 30 days for hourly)
SELECT add_retention_policy('metrics_1hour', INTERVAL '30 days', if_not_exists => TRUE);

-- ============================================================
-- 4. ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity    VARCHAR(10) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  category    VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  message     TEXT NOT NULL,
  value       DOUBLE PRECISION,
  threshold   DOUBLE PRECISION,
  status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by VARCHAR(150),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts (category, created_at DESC);

-- ============================================================
-- 5. ALERT RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS alert_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  metric_name VARCHAR(100) NOT NULL,
  operator    VARCHAR(5) NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '==')),
  threshold   DOUBLE PRECISION NOT NULL,
  severity    VARCHAR(10) NOT NULL DEFAULT 'warning',
  duration    INT NOT NULL DEFAULT 60,
  cooldown    INT NOT NULL DEFAULT 300,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default alert rules
INSERT INTO alert_rules (name, description, metric_name, operator, threshold, severity, duration, cooldown) VALUES
  ('CPU Critical', 'CPU usage di atas 90%', 'cpu_percent', '>', 90, 'critical', 60, 300),
  ('CPU Warning', 'CPU usage di atas 75%', 'cpu_percent', '>', 75, 'warning', 120, 600),
  ('Memory High', 'Memory usage di atas 85%', 'memory_used_percent', '>', 85, 'warning', 120, 600),
  ('Disk Almost Full', 'Disk usage di atas 90%', 'disk_used_percent', '>', 90, 'critical', 60, 300),
  ('Error Rate Spike', 'Error rate di atas 5%', 'error_rate_percent', '>', 5, 'critical', 30, 300),
  ('High Latency', 'P95 latency di atas 500ms', 'latency_p95_ms', '>', 500, 'warning', 60, 300),
  ('DB Pool Exhausted', 'Active connections > 80% pool', 'pool_active', '>', 16, 'warning', 30, 300),
  ('Cache Miss Spike', 'Cache hit ratio di bawah 80%', 'cache_hit_ratio', '<', 0.80, 'warning', 60, 300),
  ('No Orders', 'Tidak ada order dalam 10 menit', 'orders_per_min', '==', 0, 'warning', 600, 1800),
  ('Revenue Drop', 'Revenue turun di bawah 100rb/menit', 'revenue_per_min', '<', 100000, 'info', 300, 3600)
ON CONFLICT DO NOTHING;
