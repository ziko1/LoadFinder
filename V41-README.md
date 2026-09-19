# LoadFinder v41 — Durable Notifications

Built from the verified v40 artifact.

Changes:
- Added a durable `SeenLoadIdsStore` with a 5000-ID history, independent of the 100-item UI result cache.
- Auto Search now deduplicates notifications against the durable history.
- Blank load IDs are never treated as new notification candidates.
- Seen IDs are persisted after a successful search, so old results falling out of the UI cache do not generate repeat notifications.
- `CancellationException` is rethrown by `AutoSearchWorker` instead of being converted into retry/failure.
- Notification EUR price formatting uses `Locale.ROOT` for deterministic output.
- Added a regression test for notification price formatting.

Verification performed:
- ZIP extraction/integrity check
- Kotlin source inventory
- brace-balance scan
- TODO() scan
- duplicate Kotlin class-name scan
- hard-coded secret-pattern scan
- legacy Android source-tree scan
- notification formatting scan
- durable seen-ID wiring scan
- cancellation handling scan
- test-source count and expected regression test presence

Environment limitation:
- This artifact was statically verified here. A full Android Gradle build/runtime was not claimed unless the required Android SDK/Gradle dependencies were available.
