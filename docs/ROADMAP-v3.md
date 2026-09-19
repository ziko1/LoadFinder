# v3 roadmap

Implemented in this build:
- backend configuration
- Trans.eu OAuth authorization boundary
- secure server-side credential handling
- GPS location storage schema
- Android -> backend API client
- exchange connection screen
- production database foundation
- mock search remains available

Next:
1. Complete Trans.eu freight-list mapping against the application's approved API scope.
2. Add encrypted token storage (KMS/secret manager in production).
3. Add authenticated driver accounts (JWT/OIDC).
4. Add Redis queue for polling/callback processing.
5. Add FCM notifications.
6. Add map + route direction.
7. Add TIMOCOM adapter after API credentials/access.
8. Add Transporeon adapter after carrier-program/API approval.
9. Add audit log and idempotency.
10. Add manual confirmation for bid/accept operations.
