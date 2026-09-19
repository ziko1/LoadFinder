# v12 — Production Hardening

## Added
- PostgreSQL/PostGIS schema for drivers, GPS, loads, callbacks and audit events
- idempotency storage boundary
- authenticated-user boundary
- health-check helper
- configurable HTTP road-routing provider
- bounded unified-search endpoint contract
- FCM token storage/sender boundary
- Android push-token API
- centralized search settings model

## Security
OAuth secrets remain backend-only.
Production authentication must validate OIDC/JWT and derive driver identity from the verified subject.
BID/ACCEPT must use idempotency keys and audit events.

## Routing
The configurable HTTP routing client is compatible with OSRM-style routing APIs. Configure a controlled/self-hosted routing service for production rather than relying on an anonymous public endpoint.

## Database
Use PostGIS for spatial queries and indexes. Retain raw provider payloads only as needed and protect them as operational data.

## Remaining integration work
- connect the v12 routes to the main Fastify bootstrap
- PostgreSQL repository implementation
- Redis cache/rate limiter
- Firebase Admin credentials
- OIDC/JWKS middleware
- TIMOCOM authenticated client
- real integration/sandbox tests
- signed Android release build
