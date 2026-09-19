CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- LoadFinder v14 production persistence. Run after v13_production.sql.
create table if not exists trans_eu_connections (
  driver_id uuid primary key references drivers(id) on delete cascade,
  access_token_enc text not null,
  access_token_iv text not null,
  access_token_tag text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  token text not null,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(driver_id, token)
);

create table if not exists auto_bid_events (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  provider text not null,
  external_id text not null,
  amount_eur numeric(12,2) not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists auto_bid_events_driver_created_idx on auto_bid_events(driver_id, created_at desc);
