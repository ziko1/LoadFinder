# LoadFinder — Product Roadmap & Delivery Status

## Current runtime baseline — September 2026

The historical v2–v74 tables below describe source presence, not production acceptance.
They are retained as development history; use this section and [RUNNING.md](docs/RUNNING.md)
for current status.

| Area | Current evidence / remaining gate |
|---|---|
| Complete source upload | Android, Gradle wrapper, backend, migrations and CI are in GitHub |
| API runtime | Android response shape, distance/filter calculations, JWT checks and cross-user access covered by request-level tests |
| Storage | Clean PostGIS schema and repeatable migrations; encrypted OAuth tokens, notification retry/deduplication and Redis round trip tested in CI |
| Android account | AppAuth browser login with PKCE, encrypted session, refresh and local logout implemented; actual issuer configuration required |
| Android UI | Search, saved results, persisted settings, account connection, map and notification navigation wired into the main screen |
| Notifications | Firebase gateway and Android token registration implemented; actual Firebase delivery requires credentials and a device |
| Android runtime | APK/unit and emulator smoke workflows cover launch, encrypted storage and Hilt WorkManager initialization |
| Release | Signed APK/AAB workflow and configuration checks implemented; keystore and production service configuration required |
| Live acceptance | Real account, HTTPS deployment, GPS search, FCM delivery and explicitly approved exchange actions remain to be tested in the owner's environment |

No TIMOCOM/Teleroute/other-exchange integration, Play Store publication, backup restore
rehearsal, or production deployment is claimed.

Status legend:
- ✅ DONE — implemented and statically verified in the current artifact
- 🟡 PARTIAL — skeleton/wiring exists, but production integration is incomplete
- ⬜ TODO — not implemented or not verified

## 1. Android application

| Area | Status | Notes |
|---|---|---|
| Kotlin + Jetpack Compose | ✅ DONE | Main UI and Compose stack present |
| GPS foreground service | ✅ DONE | Location service + permissions |
| Background Auto Search | ✅ DONE | WorkManager/Hilt worker |
| Search radius 10–200 km | ✅ DONE | Persisted search settings |
| Vehicle / price / €/km / empty km filters | ✅ DONE | Worker + repository filtering |
| Match Score | ✅ DONE | Calculator and filtering |
| Results persistence | ✅ DONE | Local result store |
| Durable seen-load history | ✅ DONE | 5000 IDs |
| Notification deduplication | ✅ DONE | Blank/duplicate/already-seen IDs filtered |
| FCM handling | ✅ DONE | Messaging service present |
| Map | ✅ DONE | Google Maps Compose wiring present |
| Driver/navigation workflow | ✅ DONE | Existing route/navigation screens |
| Auto Bid policy | ✅ DONE | Limits/cooldowns/strategy logic present |
| Auto Accept | ✅ DONE | Manual-confirmation gate exists |
| Backend API adapter | ✅ DONE | v43 uses backend by default |
| Backend URL configuration | ✅ DONE | Build property |
| Android authentication UI/token acquisition | ⬜ TODO | Token store/interceptor exist, login/OIDC flow does not |
| Release signing / Play build | ⬜ TODO | Not verified here |
| Full device/runtime verification | ⬜ TODO | Requires Android SDK/device/emulator |

## 2. Backend

| Area | Status | Notes |
|---|---|---|
| Fastify API | ✅ DONE | Server exists |
| `/health` | ✅ DONE | Versioned health response |
| `/v1/loads` | ✅ DONE | Added in v43; authenticated in v45 |
| Search validation/filtering | ✅ DONE | Coordinates, radius and filters |
| Unified exchange abstraction | ✅ DONE | Provider interface exists |
| Mock provider | ✅ DONE | Explicit development mode only |
| Auth middleware/JWKS | ✅ DONE | Existing security layer |
| Redis rate limiting | ✅ DONE | Existing resilience layer |
| PostgreSQL/PostGIS | ✅ DONE | Persistence layer present |
| GPS persistence | ✅ DONE | Existing endpoint/store |
| Auto Search state/wake | ✅ DONE | Existing backend endpoints |
| Trans.eu OAuth skeleton | 🟡 PARTIAL | Credentials/scope/endpoint mapping required |
| Real Trans.eu load search | ⬜ TODO | Requires approved current API contract |
| Real Trans.eu bidding/accept | ⬜ TODO | Requires approved API scope |
| TIMOCOM adapter | ⬜ TODO | Official API access required |
| Teleroute adapter | ⬜ TODO | Official API access required |
| Transporeon adapter | ⬜ TODO | Official API access required |
| CargoON adapter | ⬜ TODO | Official API access required |
| 123cargo / Wtransnet adapters | ⬜ TODO | Official API access required |
| Production auth/token issuance | ⬜ TODO | Need chosen identity provider/user model |
| DB migrations/versioning | 🟡 PARTIAL | Versioned migration runner added in v46; backup/restore rehearsal still required |
| Production observability | 🟡 PARTIAL | Health exists; full metrics/logging/tracing pending |

## 3. Automation / business rules

| Area | Status |
|---|---|
| Auto Search master switch | ✅ DONE |
| Auto Bid master switch | ✅ DONE |
| Auto Accept OFF/manual confirmation | ✅ DONE |
| Bid min price | ✅ DONE |
| Min €/km | ✅ DONE |
| Max empty distance | ✅ DONE |
| Max total distance | ✅ DONE |
| Min Match Score | ✅ DONE |
| Preferred routes/countries | ✅ DONE |
| Rate limit / max bids / cooldown | ✅ DONE |
| Profit calculator | ✅ DONE |
| Next-load planning | ✅ DONE |

## 4. Security / compliance

| Area | Status |
|---|---|
| No embedded production secrets | ✅ DONE |
| Bearer auth transport | ✅ DONE |
| Explicit mock mode | ✅ DONE |
| No scraping/CAPTCHA bypass | ✅ DONE |
| Financial/contractual auto actions require confirmation | ✅ DONE |
| Production secret management | ⬜ TODO |
| Audit log for contractual actions | 🟡 PARTIAL |
| Privacy/retention policy implementation | ⬜ TODO |
| GDPR export/delete workflow | ⬜ TODO |

## 5. CI/CD and deployment

| Area | Status |
|---|---|
| GitHub Actions CI | ✅ DONE |
| Backend dependency preflight | ✅ DONE |
| Backend tests | ✅ DONE (static/source tests present) |
| Android tests | ✅ DONE (unit-test sources present) |
| Actual backend dependency-clean build in this environment | ⬜ TODO |
| Actual Android Gradle build in this environment | ⬜ TODO |
| Backend production Docker image | 🟡 PARTIAL |
| Managed Postgres/Redis deployment | 🟡 PARTIAL | Production compose with health checks added; hosting execution still required |
| HTTPS/domain/reverse proxy | 🟡 PARTIAL | Production nginx template added; actual certificates/domain deployment still required |
| Production secrets | ⬜ TODO |
| Android signed release/AAB | ⬜ TODO |
| Play Store release | ⬜ TODO |

## 6. Definition of "ready for production"

All remaining ⬜ items are not optional release cosmetics. The release gate requires:
1. At least one real exchange provider connected with valid official API credentials.
2. Real authentication and user/account lifecycle.
3. Production database migrations and backups.
4. HTTPS deployment with secret management.
5. Backend and Android dependency-clean builds.
6. Device/runtime test of GPS → Auto Search → API → results → notification.
7. Contractual action audit logging and manual confirmation.
8. Release-signed Android build.

## Current release baseline

**Verified code baseline:** LoadFinder v43
**Current artifact:** `LoadFinder-v43-Backend-Wiring-Verified.zip`

The next implementation priority is the first real exchange provider plus production authentication/deployment gates. Mock data must not be presented as live exchange data.


## v46 implementation
- ✅ Versioned PostgreSQL migration runner with `schema_migrations`.
- ✅ Production Compose executes migrations before API/worker.
- ✅ Production deployment/rollback runbook added.
- ⬜ Actual VPS execution, TLS certificate issuance, backups and restore rehearsal.

## v47 implementation
- ✅ Fixed driver location persistence column mismatch between backend code and production PostGIS schema.
- ✅ Android API bearer token now persists encrypted with Android Keystore-backed AES/GCM.
- ✅ Added regression contracts for both fixes.
- ⬜ Full OIDC login/refresh UI and refresh-token lifecycle remain to be implemented.

## v48 implementation
- ✅ Aligned Android location API call with the implemented `/v13/driver/location` backend route.
- ✅ Added production startup guard against silently using in-memory OAuth token storage.
- ✅ Added regression contracts for API route drift and production auth storage.
- ⬜ Full Android OIDC login/refresh flow remains pending.
- ⬜ Real Trans.eu freight search remains pending until the application's approved API scope/current endpoint contract is provisioned.

## v49 implementation
- ✅ Implemented Trans.eu refresh-token storage encrypted in PostgreSQL.
- ✅ Implemented automatic access-token refresh before API calls and one retry on HTTP 401.
- ✅ Persists the latest refresh token returned by Trans.eu.
- ✅ Added database migration and regression tests.
- ⬜ Android application login/session issuance against LoadFinder backend remains pending.
- ⬜ Real Trans.eu freight-proposal list/search mapping remains pending until the approved scope and exact response contract are provisioned.

## v50 implementation
- ✅ Verified current official Trans.eu freight proposal list endpoint: `GET /ext/freights-api/v2/freight-proposals`.
- ✅ Implemented authenticated server access with documented `page`, `sortBy`, and `order` parameters.
- ✅ Added conservative Trans.eu proposal normalizer using official response fields; unsupported currencies are rejected rather than silently converted.
- ✅ Added Android API surface and regression tests.
- ⚠️ Generic LoadFinder search is not yet fed by this per-user Trans.eu list because the current unified provider interface lacks authenticated driver context; no fake/mock substitution was introduced.

## v51 implementation
- ✅ Unified provider interface now carries authenticated driver context.
- ✅ Real Trans.eu provider is wired into the main search engine and Auto Search worker.
- ✅ Trans.eu search is bounded to 5 pages (maximum 150 proposals per run) and filters by pickup radius before ranking.
- ✅ Mock provider is no longer the default; it is explicitly enabled only with `LOADFINDER_ENABLE_MOCK_PROVIDER=true`.
- ✅ v1 and v14 searches now pass the authenticated driver ID.
- ⚠️ Real Trans.eu API credentials/scopes and an actual account are still required for live network verification.

## v52 implementation
- ✅ Added provider-aware Android offer/accept compatibility routes.
- ✅ Android contractual actions now require an explicit `confirmed=true` argument; they are no longer silently auto-confirmed.
- ✅ Backend validates provider prefix (`trans.eu`) before executing contractual actions.
- ✅ Existing Trans.eu workflow/version checks remain the single execution path.
- ✅ Added regression tests for contractual confirmation and endpoint wiring.
- ⚠️ Live offer/accept against Trans.eu remains unverified until valid production credentials, scope, and a real proposal are available.

## v54 implementation
- ✅ Added provider-aware normalized load-detail endpoint for `trans.eu:<offer-id>`.
- ✅ Android Backend API now has a typed detail call.
- ✅ Detail endpoint resolves authoritative Trans.eu proposal details through the existing OAuth/token workflow.
- ✅ Contract regression tests added.
- ⚠️ Android Gradle/runtime and live Trans.eu credentials remain unavailable in this environment, so no live E2E claim is made.

## v55 implementation
- ✅ Replaced Android detail fallback that performed a broad `/v1/loads` search.
- ✅ `/v1/loads/:loadId` now returns normalized load fields directly from authoritative Trans.eu proposal details.
- ✅ Detail response includes offerId/version metadata needed for contractual actions.
- ✅ Added regression tests for normalized detail and no-second-search behavior.

## v56 implementation
- ✅ Added Android load-detail dialog with real normalized data.
- ✅ Added explicit Offer confirmation dialog before contractual submission.
- ✅ Added explicit Accept confirmation dialog before contractual acceptance.
- ✅ Added offer amount entry and action status feedback.
- ✅ Repository now exposes detail/offer/accept operations while preserving cancellation behavior.
- ⚠️ Live Trans.eu execution and dependency-clean Android/backend builds remain unverified in this environment.

## v57 implementation
- ✅ Removed hardcoded Berlin coordinates from manual search.
- ✅ Added Fused Location current-location provider.
- ✅ Search now stops with a clear state when location is unavailable.
- ✅ Android UI requests fine/coarse location permission before enabling search.
- ✅ Added regression tests for real-location search and permission gating.
- ⚠️ Background service and authenticated driver-location upload remain separate flows; live GPS/device verification still requires an Android runtime.

## v58 implementation
- ✅ Hardened location foreground service for target SDK 35 with explicit `FOREGROUND_SERVICE_TYPE_LOCATION`.
- ✅ Service now accepts either fine or coarse location and stops safely without permission.
- ✅ Added explicit Start live GPS / Stop live GPS controls.
- ✅ Foreground service is initiated from the visible UI rather than an arbitrary background worker.
- ✅ Added regression tests for Android foreground-location requirements.
- ⚠️ Physical Android runtime and Gradle build remain unverified in this environment.

## v59 implementation
- ✅ Auto Search now uses the latest GPS persisted by the foreground service.
- ✅ Significant movement (5 km) can trigger a one-time refresh while Auto Search is enabled.
- ✅ Movement refresh is throttled to 5 minutes and deduplicated with unique WorkManager work.
- ✅ Worker records the exact GPS point and timestamp used for each search.
- ✅ Added explicit Start Auto Search action that obtains current GPS, enables Auto Search, and starts live tracking.
- ⚠️ WorkManager remains subject to Android scheduling; periodic work has a 15-minute minimum and is not real-time. Live runtime still requires an actual device/emulator.

## v60 implementation
- ✅ Auto Search result cache is now an observable snapshot with revision/timestamp metadata.
- ✅ HomeViewModel automatically receives new result snapshots while the app process is alive.
- ✅ Added explicit Refresh results action using the current GPS and current filters.
- ✅ UI shows the last result update time and an empty-result state.
- ✅ Auto Search worker replaces the previous result snapshot instead of accumulating stale results.
- ⚠️ Exchange pagination remains provider-dependent; current unified Android result contract is capped at 100 items.

## v61 implementation
- ✅ Added server-side paginated `/v1/loads/page` contract with bounded page size and `hasMore`.
- ✅ Preserved the existing `/v1/loads` list endpoint for backward compatibility.
- ✅ Android Backend API now exposes typed page metadata.
- ✅ Repository/ViewModel/UI support first-page replacement and incremental Load more.
- ✅ Result rows are keyed by stable load ID and deduplicated when pages are appended.
- ⚠️ This is bounded API pagination, not yet a full Jetpack Paging/Room RemoteMediator implementation; that can be added after the backend contract is proven on a real build/device.

## v62 implementation
- ✅ Added Jetpack Paging 3.5.1 runtime + Compose integration.
- ✅ Added network-backed `LoadPagingSource` using the v61 `/v1/loads/page` contract.
- ✅ Added `LoadPagingRepository` with bounded `PagingConfig` and refresh-key handling.
- ✅ Added Compose `collectAsLazyPagingItems()` rendering with stable load IDs.
- ✅ Preserved the v61 manual Load more pipeline as a compatibility/fallback path.
- ⚠️ This still requires a real Android dependency-resolved build to validate library compatibility in the project.

## v63 implementation
- ✅ Made Jetpack Paging the primary Search Results UI path.
- ✅ Fixed v62 flow-lifecycle issue by exposing a reactive `StateFlow<Flow<PagingData<Load>>>`.
- ✅ Added Paging refresh and retry handling for initial-load and append errors.
- ✅ Removed the old manual `Load more` button from the primary UI.
- ✅ Kept the v61 manual pagination code internally for compatibility/regression coverage.
- ⚠️ Real Gradle dependency resolution and device runtime remain unverified in this environment.

## v64 implementation
- ✅ Removed duplicate legacy result rendering from the primary Search UI.
- ✅ Main Search button now starts the Paging pipeline directly.
- ✅ Refresh selects the active Paging session once Paging has started.
- ✅ Retained Auto Search's persisted snapshot independently for background-result history.
- ⚠️ Actual Android Gradle compilation still requires a dependency-resolved environment/device.

## v65 implementation
- Added immutable `SearchContext` binding GPS coordinates + filters + generation revision.
- Paging flow is recreated with `collectLatest` whenever the search context changes.
- Filter changes immediately create a new Paging generation.
- Invalid coordinates are rejected before Pager creation.
- Added regression tests for context replacement and PagingSource non-reuse.

## v66 implementation
- Added `LiveLocationStore` as the process-local live GPS bus.
- Foreground location service publishes validated GPS fixes while retaining Auto Search updates.
- Active Paging search follows live GPS after 1 km movement with a 60-second anti-refresh cooldown.
- Each accepted live GPS move creates a new SearchContext revision, replacing the Paging flow.
- Service clears the live location on destruction.

## v67 implementation
- Runtime permission guard before foreground location service start.
- Permission state rechecked whenever HomeScreen resumes.
- Foreground-service start exceptions are surfaced instead of silently failing.
- Direct Android Location settings entry added.
- Android 14+ location FGS manifest contract retained.

## v68 implementation
- Found and fixed a real Kotlin DSL defect in `LOADFINDER_BASE_URL` `buildConfigField` quoting.
- Corrected build preflight assumptions: this project uses KSP rather than kapt.
- Added regression tests for KSP/Hilt/Paging/location dependencies and BuildConfig string syntax.
- Environment check confirms no Gradle wrapper and no system Gradle, so a dependency-resolved compile is not claimed.

## v69 implementation
- Audited actual Gradle project layout.
- Added deterministic wrapper/system-Gradle preflight.
- Added explicit bootstrap instructions rather than fabricating wrapper binaries.
- Added build dependency regression coverage.
- APK/Gradle compilation remains unclaimed because no wrapper/system Gradle is available in this environment.

## v70 implementation
- Added a source/build preflight that audits the real Android project layout, plugins, critical dependencies and manifest.
- Added Kotlin source integrity checks for brace balance, duplicate declarations and TODO() regressions.
- No APK build is claimed: the repository still lacks a Gradle wrapper and the environment lacks system Gradle.

## v71 implementation
- Added a GitHub Actions Android build workflow for PC-free/cloud APK compilation.
- Workflow uses JDK 17, requires a real Gradle wrapper, builds debug APK, runs unit tests, and uploads artifacts.
- Workflow intentionally fails closed if `gradlew` is absent.
- Added cloud-build documentation and regression coverage.
- No cloud build was executed from this environment, so no APK build success is claimed.

## v72 implementation
- Removed the unnecessary Gradle-wrapper blocker from the cloud build path.
- GitHub Actions now installs Gradle 8.9 with `gradle/actions/setup-gradle@v6`.
- Gradle 8.9 is pinned because the project uses AGP 8.7.3.
- Cloud build remains fail-closed on missing project files and actual Gradle build/test failures.
- No APK build success is claimed from this environment.

## v73 implementation
- Fixed AutoSearchScheduler.cancel() to cancel both periodic and movement-triggered refresh work.
- Added regression coverage for cancellation of both unique WorkManager jobs.
- Added backend GitHub Actions CI using Node.js 22, npm ci, tests, and TypeScript build.
- Existing Android cloud-build workflow from v72 retained.
- No real GitHub Actions/APK/backend cloud run was executed from this environment; no remote build success is claimed.

## v74 implementation
- Added a dedicated source-preflight GitHub Actions workflow.
- Added `ci/verify_project.py` as the concrete repository preflight target.
- Added regression coverage for the Android cloud-build workflow.
- Preserved v73 Auto Search cancellation and backend CI changes.
- No remote APK build is claimed until GitHub Actions actually executes.
