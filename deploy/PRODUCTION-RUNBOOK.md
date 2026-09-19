# LoadFinder Production Runbook

## Preconditions
1. Docker Engine + Compose v2 installed.
2. A DNS name points to the server.
3. Real identity-provider JWKS URL is available.
4. Production Trans.eu credentials are approved and stored only in the deployment secret store.
5. Strong random PostgreSQL password and TOKEN_ENCRYPTION_KEY are generated.

## First deployment
1. Copy `.env.example` to `.env` and replace every `CHANGE_ME`/placeholder.
2. Never commit `.env`.
3. Start the stack: `docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build`.
4. Verify migration container completed successfully.
5. Verify API health over localhost first, then through HTTPS.
6. Configure TLS certificate and DNS in the reverse proxy.
7. Register the exact HTTPS Trans.eu callback URL in the Trans.eu application.
8. Keep `AUTO_BID_LIVE=false` until end-to-end tests are complete.

## Release gate
- Authentication works with a real test account.
- GPS reaches backend and is persisted.
- Auto Search runs from fresh GPS position.
- A real provider returns a real load.
- Notification arrives once for a new load.
- Bid preview matches policy.
- Contractual bid/accept still requires explicit confirmation.
- Audit event is recorded.
- Database backup and restore have been rehearsed.
- Signed Android release build has been installed on a physical device.

## Rollback
- Stop API/worker.
- Preserve database volume and logs.
- Deploy the previously verified image/artifact.
- Do not delete production database data as a rollback shortcut.
