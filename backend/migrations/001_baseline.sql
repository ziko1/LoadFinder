-- Canonical schema. Old SQL snapshots are historical and must not be auto-executed.
DO $$ BEGIN
  IF to_regclass('public.loads') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='loads' AND column_name='provider'
  ) THEN RAISE EXCEPTION 'Legacy loads schema detected. Back up and convert the existing database before migration; no data has been deleted.';
  END IF;
  IF to_regclass('public.driver_locations') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='driver_locations' AND column_name='captured_at'
  ) THEN RAISE EXCEPTION 'Legacy driver_locations schema detected. Back up and convert before migration.';
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY,
  external_subject text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_locations (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  position geography(Point,4326) NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS driver_locations_user_captured_idx
  ON driver_locations(user_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS driver_search_positions (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  position geography(Point,4326) NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_search_state (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  radius_km integer NOT NULL DEFAULT 100 CHECK (radius_km > 0 AND radius_km <= 250),
  interval_seconds integer NOT NULL DEFAULT 900 CHECK (interval_seconds >= 60),
  max_notifications_per_run integer NOT NULL DEFAULT 10 CHECK (max_notifications_per_run >= 0),
  last_run_at timestamptz,
  next_run_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_search_runs (
  id bigserial PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  found_count integer NOT NULL DEFAULT 0,
  notified_count integer NOT NULL DEFAULT 0,
  error text
);
CREATE INDEX IF NOT EXISTS auto_search_runs_driver_started_idx
  ON auto_search_runs(driver_id, started_at DESC);

CREATE TABLE IF NOT EXISTS load_snapshots (
  provider text NOT NULL,
  external_id text NOT NULL,
  pickup geography(Point,4326),
  delivery geography(Point,4326),
  pickup_time timestamptz,
  price_eur numeric(14,2),
  distance_km numeric(12,2),
  score numeric(6,2),
  profit_eur numeric(14,2),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, external_id)
);
CREATE INDEX IF NOT EXISTS load_snapshots_last_seen_idx
  ON load_snapshots(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS loads (
  provider text NOT NULL,
  external_id text NOT NULL,
  pickup geography(Point,4326),
  delivery geography(Point,4326),
  price_eur numeric(14,2),
  distance_km numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, external_id)
);

CREATE TABLE IF NOT EXISTS load_notifications (
  id bigserial PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(driver_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS push_tokens (
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL DEFAULT 'android',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(driver_id, token)
);

CREATE TABLE IF NOT EXISTS trans_eu_connections (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  access_token_enc text NOT NULL,
  access_token_iv text NOT NULL,
  access_token_tag text NOT NULL,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_bid_events (
  id bigserial PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_id text NOT NULL,
  amount_eur numeric(14,2) NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auto_bid_events_driver_created_idx
  ON auto_bid_events(driver_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  action text NOT NULL,
  external_id text,
  idempotency_key text UNIQUE,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_driver_created_idx
  ON audit_events(driver_id, created_at DESC);
ALTER TABLE trans_eu_connections
  ADD COLUMN IF NOT EXISTS refresh_token_enc text,
  ADD COLUMN IF NOT EXISTS refresh_token_iv text,
  ADD COLUMN IF NOT EXISTS refresh_token_tag text;
CREATE TABLE IF NOT EXISTS exchange_actions (
  id BIGSERIAL PRIMARY KEY,
  driver_id TEXT NOT NULL,
  exchange TEXT NOT NULL,
  load_id TEXT NOT NULL,
  action TEXT NOT NULL,
  amount_eur NUMERIC,
  idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL,
  response_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exchange_actions_driver_time_idx
ON exchange_actions(driver_id, created_at DESC);

ALTER TABLE load_notifications ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE load_notifications ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE load_notifications ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS load_notifications_pending_idx ON load_notifications(driver_id,created_at DESC) WHERE sent_at IS NULL;
CREATE TABLE IF NOT EXISTS driver_routes (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash text PRIMARY KEY,
  subject text NOT NULL,
  expires_at timestamptz NOT NULL
);
