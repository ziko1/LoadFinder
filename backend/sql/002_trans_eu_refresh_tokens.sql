ALTER TABLE trans_eu_connections
  ADD COLUMN IF NOT EXISTS refresh_token_enc text,
  ADD COLUMN IF NOT EXISTS refresh_token_iv text,
  ADD COLUMN IF NOT EXISTS refresh_token_tag text;
