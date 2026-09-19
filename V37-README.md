# LoadFinder v37 — Auto Search GPS/Settings Reliability

Changes from v36:
- Fixed AutoSearchWorker to use persisted user SearchSettings instead of constructing defaults on every run.
- Fixed periodic Auto Search coordinates: LocationForegroundService now updates the latest GPS position used by the Worker.
- Added persistent AutoSearch enabled state.
- Auto Search Worker exits safely when the feature is disabled.
- HomeViewModel restores persisted SearchSettings at startup.
- Removed the stale duplicate WorkerConstraintsTest from the legacy package.
- Added LoadRepository filtering regression test covering max empty distance and minimum €/km.
- Added kotlinx-coroutines-test for repository coroutine tests.

Verification performed after edits:
- 40 main Kotlin source files scanned.
- 3 Android unit-test files scanned.
- WorkerConstraintsTest declaration count: 1.
- Kotlin brace-balance audit: PASS.
- AutoSearchWorker settings source: PASS.
- Latest-GPS forwarding: PASS.
- Auto-search enable/disable guard: PASS.
- WorkManager 15-minute scheduling: PASS.
- ZIP integrity: PASS.

Not claimed: an actual Gradle/APK compilation, because the current environment does not contain an Android Gradle toolchain/SDK.
