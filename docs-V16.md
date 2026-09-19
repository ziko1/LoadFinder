# LoadFinder v16

## Production Auto Search pipeline

Android GPS → `driver_search_positions` → persistent `auto_search_state` → scheduler → Redis → worker → exchange adapters → dedupe/ranking → `load_snapshots` → notification de-duplication → PushGateway → Android deep link.

### API
- `POST /v16/driver/location` — stores the authenticated driver's latest search position.
- `PUT /v16/auto-search/state` — enables/disables recurring search and configures radius, interval and notification cap.
- `POST /v16/auto-search/wake` — immediately queues a search for the authenticated driver.
- `npm run worker` — starts the scheduler + Redis consumer worker.

### Safety
Auto-Bid and Auto-Accept remain separate from this pipeline and are not enabled by this release. Contractual actions still require explicit confirmation unless a future deployment deliberately enables the existing policy gates.

### Production notes
Use separate API and worker processes. Run PostgreSQL migrations through v15 and v16 SQL. Replace `LogPushGateway` with Firebase Admin/FCM before production mobile notifications. Real exchange integrations require approved official API credentials.
