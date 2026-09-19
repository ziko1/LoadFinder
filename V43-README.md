# LoadFinder v43 — Backend Search Wiring

Built from verified v42.

Implemented:
- Added the backend `GET /v1/loads` endpoint expected by the Android client.
- Endpoint validates latitude/longitude/radius and applies radius, €/km, empty-distance, vehicle and minimum-score filters.
- Added normalized API mapping from the unified exchange layer.
- Android now has a `BackendExchangeAdapter` and uses it by default.
- Added bearer-token interceptor/store without embedding credentials.
- Android backend URL is configurable through `-PLOADFINDER_BASE_URL`.
- Mock data remains available only through explicit `-PLOADFINDER_USE_MOCK=true`.
- Added a regression contract test for the new backend route.

Still not implemented:
- Real Trans.eu freight search endpoint mapping is still pending approved/current official API scope and schema.
- TIMOCOM/Transporeon/Teleroute/CargoON/etc. live adapters are not yet implemented.
- Android authentication/token acquisition UI is not implemented; a valid bearer token must be supplied by the future auth flow.
- Full Android Gradle build/runtime was not claimed in this environment because Gradle/Android SDK were unavailable.

Verification:
- Re-extracted v42 and inspected actual paths before edits.
- Project-wide source brace scan.
- TODO() scan.
- package-aware duplicate Kotlin declarations.
- hard-coded secret scan.
- legacy Android source-tree scan.
- backend route contract checks.
- Android backend adapter/API wiring checks.
- ZIP integrity.
