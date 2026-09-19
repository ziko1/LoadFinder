# LoadFinder v15 — Production Auto Search Pipeline

Built on v14 without removing prior functionality.

## Added
- Durable `load_snapshots` PostgreSQL/PostGIS storage with upsert and stale-load pruning.
- Durable `auto_search_state` and `auto_search_runs` tables.
- Redis-backed `SearchQueue` using `BRPOP/LPUSH`.
- `AutoSearchService`: exchange search → ranking → persistence → run audit.
- Authenticated `POST /v15/auto-search/enqueue` endpoint.
- Server health version bumped to v15.

## Safety
- Queue jobs contain coordinates and the authenticated external driver subject; no client-supplied internal UUID.
- Auto-bid/accept confirmation rules from v14 remain unchanged.
- No scraping, CAPTCHA bypass, or rate-limit bypass.

## Production wiring still required
- Run SQL files in a fresh Postgres volume.
- Start a dedicated worker process invoking `AutoSearchService.startWorker()`.
- Configure REDIS_URL/DATABASE_URL and production JWT/OIDC.
- Connect a real FCM PushGateway implementation.
- Add provider-specific authenticated adapters as API access is approved.
