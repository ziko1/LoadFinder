# LoadFinder v13 — production wiring

Built on v12. This release wires the previously isolated production-hardening pieces into Fastify.

## Added
- JWT RS256 verification against configured OIDC JWKS.
- Issuer/audience/expiry validation.
- Driver identity comes from the verified token, not request JSON.
- Redis-backed fixed-window rate limiting when REDIS_URL is configured.
- PostgreSQL/PostGIS repository for driver GPS positions and audit events.
- Deep health endpoint: `/v13/health/deep`.
- Authenticated driver location endpoint: `POST /v13/driver/location`.
- Idempotent audit endpoint: `POST /v13/audit`.
- v13 SQL migration and production environment template.
- Main server now registers v13 routes.

## Security
- Existing Trans.eu contractual operations still require explicit `confirmed=true`.
- Never put Trans.eu client secret/API key in Android.
- Webhook endpoints remain public because provider callbacks need to reach them; validate provider signatures/secrets before production deployment.
- `/v13/*` requires a valid Bearer token.

## Remaining production integration
- Replace in-memory Trans.eu token store with encrypted persistent storage/KMS.
- Validate Trans.eu webhook authenticity according to the current provider contract.
- Wire Firebase Admin SDK credentials and real push delivery.
- Complete authenticated TIMOCOM client after approved API access.
- Add integration tests against provider sandboxes.
- Configure TLS, secret manager, backups and observability.
