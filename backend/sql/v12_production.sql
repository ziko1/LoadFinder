CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY,
  external_subject TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_locations (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  speed_kmh NUMERIC,
  heading_deg NUMERIC,
  accuracy_m NUMERIC,
  geom GEOGRAPHY(POINT,4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS driver_locations_driver_time_idx
  ON driver_locations(driver_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS driver_locations_geom_idx
  ON driver_locations USING GIST(geom);

CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  pickup GEOGRAPHY(POINT,4326) NOT NULL,
  delivery GEOGRAPHY(POINT,4326) NOT NULL,
  pickup_time TIMESTAMPTZ,
  price_eur NUMERIC NOT NULL,
  distance_km NUMERIC NOT NULL,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, external_id)
);

CREATE TABLE IF NOT EXISTS exchange_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID,
  action TEXT NOT NULL,
  provider TEXT,
  external_id TEXT,
  idempotency_key TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS audit_idempotency_idx
 ON audit_events(idempotency_key) WHERE idempotency_key IS NOT NULL;
