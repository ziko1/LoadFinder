-- LoadFinder v18 production reliability migration. Run after v17/v14 migrations.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS driver_search_positions (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  position GEOGRAPHY(POINT,4326) NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS driver_search_positions_captured_idx
  ON driver_search_positions(captured_at DESC);
CREATE INDEX IF NOT EXISTS driver_search_positions_position_gix
  ON driver_search_positions USING GIST(position);

CREATE TABLE IF NOT EXISTS auto_search_state (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  radius_km NUMERIC(8,2) NOT NULL DEFAULT 100 CHECK (radius_km > 0 AND radius_km <= 250),
  interval_seconds INTEGER NOT NULL DEFAULT 60 CHECK (interval_seconds BETWEEN 30 AND 3600),
  max_notifications_per_run INTEGER NOT NULL DEFAULT 10 CHECK (max_notifications_per_run BETWEEN 0 AND 50),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_search_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  found_count INTEGER NOT NULL DEFAULT 0,
  notified_count INTEGER NOT NULL DEFAULT 0,
  error TEXT
);
CREATE INDEX IF NOT EXISTS auto_search_runs_driver_started_idx
  ON auto_search_runs(driver_id, started_at DESC);

CREATE TABLE IF NOT EXISTS load_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  pickup GEOGRAPHY(POINT,4326) NOT NULL,
  delivery GEOGRAPHY(POINT,4326) NOT NULL,
  pickup_time TIMESTAMPTZ,
  price_eur NUMERIC(12,2),
  distance_km NUMERIC(12,2),
  score NUMERIC(8,2),
  profit_eur NUMERIC(12,2),
  payload JSONB,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, external_id)
);
CREATE INDEX IF NOT EXISTS load_snapshots_pickup_gix ON load_snapshots USING GIST(pickup);
CREATE INDEX IF NOT EXISTS load_snapshots_delivery_gix ON load_snapshots USING GIST(delivery);
CREATE INDEX IF NOT EXISTS load_snapshots_last_seen_idx ON load_snapshots(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS load_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, provider, external_id)
);
CREATE INDEX IF NOT EXISTS load_notifications_driver_created_idx
  ON load_notifications(driver_id, created_at DESC);

CREATE TABLE IF NOT EXISTS auto_search_job_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  external_subject TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lon DOUBLE PRECISION NOT NULL CHECK (lon BETWEEN -180 AND 180),
  radius_km NUMERIC(8,2) NOT NULL CHECK (radius_km > 0 AND radius_km <= 250),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ENQUEUED','FAILED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  enqueued_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auto_search_outbox_pending_idx
  ON auto_search_job_outbox(status, available_at);
