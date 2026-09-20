-- v16: persistent auto-search scheduling + notification state
create table if not exists load_notifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  provider text not null,
  external_id text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text,
  unique(driver_id, provider, external_id)
);
create index if not exists load_notifications_driver_idx on load_notifications(driver_id, created_at desc);

create table if not exists driver_search_positions (
  driver_id uuid primary key references drivers(id) on delete cascade,
  position geography(point,4326) not null,
  captured_at timestamptz not null default now()
);
create index if not exists driver_search_positions_gix on driver_search_positions using gist(position);

alter table auto_search_state add column if not exists next_run_at timestamptz;
alter table auto_search_state add column if not exists max_notifications_per_run integer not null default 10;
