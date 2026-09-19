CREATE TABLE IF NOT EXISTS driver_locations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  position GEOGRAPHY(POINT,4326) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS driver_locations_position_gix
ON driver_locations USING GIST(position);

CREATE INDEX IF NOT EXISTS driver_locations_user_time_idx
ON driver_locations(user_id, recorded_at DESC);
