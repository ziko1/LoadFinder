-- LoadFinder v13 production migration. Run after v12_production.sql.
create index if not exists driver_locations_driver_time_idx on driver_locations(driver_id, recorded_at desc);
create index if not exists loads_pickup_gist_idx on loads using gist(pickup);
create index if not exists loads_delivery_gist_idx on loads using gist(delivery);
create unique index if not exists audit_idempotency_idx on audit_events(idempotency_key) where idempotency_key is not null;
