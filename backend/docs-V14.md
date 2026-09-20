# LoadFinder v14 — Production Workflow

v14 builds on v13 without removing previous capabilities.

## Added
- encrypted PostgreSQL-backed Trans.eu access-token store (AES-256-GCM; master key from `TOKEN_ENCRYPTION_KEY`)
- persistent FCM token table
- unified search endpoint that runs exchange aggregation and ranking
- production profit endpoint
- Auto-Bid preview and guarded execution
- per-driver hourly/daily bid limits persisted in PostgreSQL
- `AUTO_BID_LIVE=true` is required to allow unattended execution; otherwise explicit confirmation is mandatory
- migration `sql/v14_production.sql`

## Security
- Android never receives Trans.eu client secret/API key.
- Auto-bid remains disabled unless policy `enabled=true`.
- Contractual actions stay confirmation-gated by default.
- Token encryption key must be supplied via a secret manager in production.

## Run
1. Apply migrations v12, v13, v14.
2. Set `DATABASE_URL`, `REDIS_URL`, `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE`.
3. Set `TOKEN_ENCRYPTION_KEY` to a high-entropy secret.
4. Keep `AUTO_BID_LIVE=false` for validation/sandbox.
5. Configure an approved Trans.eu API application before enabling live exchange operations.
