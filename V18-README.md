# LoadFinder v18 — Production Persistence & Deployment Integrity

V18 is a hardening pass on v17. It fixes a migration gap: v15-v17 referenced
persistent Auto Search tables that were not present in the SQL migration set.

## Included
- v18 PostgreSQL/PostGIS migration for Auto Search state/runs, positions,
  load snapshots, notifications and the DB outbox foundation.
- `pgcrypto` extension enabled before v14 UUID defaults are used.
- Fixed `docker-compose.yml` service structure; `worker` is a real service,
  not accidentally nested under `volumes`.
- Added `validate-v18.mjs` structural audit.

## Verification
- `node validate-v18.mjs` — PASS
- `node validate-v17.mjs` — PASS
- Docker runtime build is not claimed because Docker is not available in the
  current execution environment.
- TypeScript build is not claimed because npm dependencies are not installed;
  `tsc` reports missing dependency/type packages rather than a verified build.
