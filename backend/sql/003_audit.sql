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
