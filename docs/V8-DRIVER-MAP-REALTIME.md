# LoadFinder v8 — Driver Route / Realtime Layer

## Added
- vehicle position backend endpoint
- in-memory live position tracker
- active route state
- next-load controller
- Trans.eu webhook deduplication
- driver route screen
- Android vehicle-position API
- search policy with score/empty-km/EUR-per-km thresholds

## Flow

GPS
 -> backend position
 -> active route
 -> candidate loads
 -> profitability
 -> Next Load ranking
 -> push
 -> driver opens load
 -> manual BID/ACCEPT

## Important
The current route screen is the app workflow layer; a real map renderer still needs a configured map provider/API key.
The routing fallback remains approximate. Commercial ETA and road-distance calculations should use a proper routing service.

## Webhook
Persist webhook events in PostgreSQL with a unique provider/event ID in production.
Do not trust driverId from an unauthenticated request; replace it with the authenticated user's subject from JWT/OIDC.
