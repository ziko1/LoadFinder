CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS loads (
  id TEXT PRIMARY KEY,
  exchange TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  pickup GEOGRAPHY(POINT,4326) NOT NULL,
  delivery GEOGRAPHY(POINT,4326) NOT NULL,
  weight_kg INTEGER,
  volume_m3 NUMERIC,
  vehicle_type TEXT,
  price_eur NUMERIC,
  distance_km NUMERIC,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS loads_pickup_gix ON loads USING GIST(pickup);
CREATE INDEX IF NOT EXISTS loads_status_idx ON loads(status);
