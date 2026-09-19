create index if not exists drivers_external_subject_idx on drivers(external_subject);
create index if not exists push_tokens_driver_seen_idx on push_tokens(driver_id,last_seen_at desc);
