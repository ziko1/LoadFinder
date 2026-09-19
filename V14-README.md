# LoadFinder v14 — Production Workflow

v14 extends v13 and keeps the previous Android/backend capabilities.

## Production additions
- encrypted PostgreSQL-backed Trans.eu access tokens (AES-256-GCM)
- external JWT subject mapped to internal driver UUID
- persistent push-token registration
- unified search endpoint with ranking and profitability filters
- profit calculator API
- guarded Auto-Bid preview/execute flow
- PostgreSQL hourly/daily bid counters
- `AUTO_BID_LIVE=true` is required for unattended execution; otherwise explicit confirmation remains mandatory
- Docker PostGIS initialization mounts all SQL migrations

## Important
The repository still keeps exchange integrations behind official API boundaries. Trans.eu/TIMOCOM production access requires the relevant approved developer credentials/scopes. No scraping, CAPTCHA bypass, or rate-limit bypass is included.

See `docs-V14.md`.
