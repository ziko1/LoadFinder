# LoadFinder v2

Production-oriented foundation:
- Android Kotlin/Compose client
- Node.js + TypeScript + Fastify backend
- PostgreSQL + PostGIS
- Redis
- unified exchange gateway
- GPS/location pipeline
- radius search
- Match Score
- conservative Auto-Bid policy
- manual confirmation for contractual actions
- Mock exchange for development

Real exchange adapters must use the provider's current official API and permissions. The current official Trans.eu API documents OAuth 2.0 and freight lists/negotiation; TIMOCOM exposes REST APIs for freight exchange and transport orders. Transporeon Freight Marketplace supports carrier load discovery and bidding. These providers may require commercial access/permissions.

## Build and test

Requirements: JDK 17, Node.js 22 and Android SDK 35.

```bash
cd backend
npm ci
npm test
npm run build

cd ../android
./gradlew :app:assembleDebug :app:testDebugUnitTest
```

For local Android configuration, add `MAPS_API_KEY` and
`LOADFINDER_BASE_URL` to `android/gradle.properties` or pass them as Gradle
properties. Never commit real keys, tokens, `.env` files, keystores, or
`google-services.json`.

GitHub Actions runs the backend tests/build and the Android debug build on
every pull request before changes are merged into `main`.


## v3
Adds server-side Trans.eu OAuth boundary, driver location storage, Android backend client, connection UI and production-oriented roadmap.


## Product status
See [ROADMAP.md](ROADMAP.md) for the tracked DONE/PARTIAL/TODO delivery matrix.
