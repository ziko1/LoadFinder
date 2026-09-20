# LoadFinder v36 — Android Worker Wiring & Legacy Tree Cleanup

Changes from v35:
- Removed the stale duplicate `android/app/src` Android source tree; the canonical module remains `android/app/app`.
- Moved `WorkerConstraints` into the canonical Android module.
- Replaced the placeholder `AutoSearchWorker` with a real Hilt-injected `CoroutineWorker`.
- Added `AutoSearchScheduler` using unique periodic WorkManager execution (15-minute minimum cadence).
- Added connected-network constraint and bounded retry behavior.
- Added Hilt WorkManager configuration through `LoadFinderApp`.
- Added WorkManager/Hilt Work dependencies and Kotlin test dependency.
- Exposed explicit start/stop auto-search methods from `HomeViewModel`; auto-search remains opt-in and is not silently enabled.

Verification performed:
- Canonical Android source audit: PASS (38 Kotlin files).
- Duplicate legacy Android tree removed: PASS.
- Worker test moved to canonical package: PASS.
- WorkManager/Hilt dependency references checked: PASS.
- No TODO() calls in canonical Kotlin sources.
- Java 21 available.
- Gradle executable and Android SDK are not available in this environment, so no APK/Gradle build is claimed.
- Backend remains dependency-blocked from a clean TypeScript build until npm dependencies can be installed.
