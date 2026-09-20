# v13 implementation notes

## Security boundary
Android receives only short-lived access tokens from the selected identity provider. Exchange credentials remain server-side. Every `/v13/*` route requires a verified Bearer JWT; driver identity is derived from `driver_id`, `driverId`, or `sub` in the verified claims.

## GPS persistence
`POST /v13/driver/location` maps the verified subject to a UUID in `drivers` and stores a PostGIS `GEOGRAPHY(POINT,4326)` sample in `driver_locations`.

## Rate limiting
When `REDIS_URL` is configured, v13 applies a 60-request/minute fixed window per driver and route. Without Redis, the limiter fails open to preserve local development; production should always configure Redis.

## Contractual actions
Existing Trans.eu negotiate/accept endpoints still require explicit confirmation. Auto-accept remains off by default.

## Provider status
Trans.eu integration is based on the currently documented OAuth/proposal workflow. TIMOCOM remains behind an authenticated adapter boundary because its developer portal requires approved credentials/access; no undocumented endpoints are invented.
