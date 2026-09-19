-- LoadFinder v17: complete missing persistence required by v15/v16.
-- Safe to run after v14_production.sql.

create table if not exists load_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  pickup geography(point,4326) not null,
  delivery geography(point,4326) not null,
  pickup_time timestamptz,
  price_eur numeric(12,2),
  distance_km numeric(12,2),
  score numeric(6,2),
  profit_eur numeric(12,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(provider, external_id)
);
create index if not exists load_snapshots_pickup_gix on load_snapshots using gist(pickup);
create index if not exists load_snapshots_delivery_gix on load_snapshots using gist(delivery);
create index if not exists load_snapshots_last_seen_idx on load_snapshots(last_seen_at desc);

create table if not exists auto_search_state (
  driver_id uuid primary key references drivers(id) on delete cascade,
  enabled boolean not null default false,
  radius_km numeric(8,2) not null default 100 check(radius_km > 0 and radius_km <= 250),
  interval_seconds integer not null default 60 check(interval_seconds between 30 and 3600),
  max_notifications_per_run integer not null default 10 check(max_notifications_per_run between 0 and 50),
  last_run_at timestamptz,
  next_run_at timestamptz,
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
create index if not exists auto_search_runs_driver_started_idx on auto_search_runs(driver_id, started_at desc);

create table if not exists load_notifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  provider text not null,
  external_id text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text,
  attempts integer not null default 0,
  unique(driver_id, provider, external_id)
);
create index if not exists load_notifications_pending_idx
  on load_notifications(driver_id, created_at desc) where sent_at is null;

create table if not exists driver_search_positions (
  driver_id uuid primary key references drivers(id) on delete cascade,
  position geography(point,4326) not null,
  captured_at timestamptz not null default now()
);
create index if not exists driver_search_positions_gix on driver_search_positions using gist(position);

alter table auto_search_state add column if not exists last_run_at timestamptz;
alter table auto_search_state add column if not exists next_run_at timestamptz;
alter table auto_search_state add column if not exists max_notifications_per_run integer not null default 10;
alter table load_notifications add column if not exists attempts integer not null default 0;
