# LoadFinder v6 — Real Exchange Workflow

## Implemented
- Trans.eu OAuth boundary
- Server-side token storage abstraction
- Freight proposal details
- Negotiation request
- Accept request
- Accepted proposals
- Callback endpoint
- Explicit confirmation for financial/contractual actions
- Current `version` is fetched before negotiation/accept
- Android Retrofit workflow API
- Android action dialog

## Security
The sample token store is in-memory only. Production must use encrypted persistent storage/KMS/secret manager.
Never put TRANS_EU_CLIENT_SECRET or TRANS_EU_API_KEY into the Android APK.

## Important API limitation
Trans.eu currently documents API negotiation for direct offers, partner offers and fixed-route offers.
Exchange-offer negotiation by carriers is available on the Trans.eu platform, not through this carrier API flow.

## Next
1. Persist OAuth tokens encrypted.
2. Add user JWT/OIDC and remove driverId from trusted request bodies.
3. Persist callback events and add idempotency.
4. Wire real FCM push notifications.
5. Replace geodesic distance with configurable routing engine.
6. Implement TIMOCOM adapter after API credentials/contract are available.
7. Add real Google Maps/MapLibre rendering and navigation.
