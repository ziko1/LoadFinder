-- v15: durable unified-load storage and worker state
create table if not exists load_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  pickup geography(point,4326),
  delivery geography(point,4326),
  pickup_time timestamptz,
  price_eur numeric(12,2),
  distance_km numeric(12,2),
  score numeric(5,2),
  profit_eur numeric(12,2),
  payload jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(provider, external_id)
);
create index if not exists load_snapshots_pickup_gix on load_snapshots using gist(pickup);
create index if not exists load_snapshots_last_seen_idx on load_snapshots(last_seen_at desc);

create table if not exists auto_search_state (
  driver_id uuid primary key references drivers(id) on delete cascade,
  enabled boolean not null default false,
  radius_km numeric(8,2) not null default 100,
  interval_seconds integer not null default 60,
  last_run_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists auto_search_runs (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  found_count integer not null default 0,
  notified_count integer not null default 0,
  error text
);
create index if not exists auto_search_runs_driver_idx on auto_search_runs(driver_id, started_at desc);
