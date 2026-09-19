# LoadFinder v38

Auto Search reliability and persistence hardening.

Changes:
- GPS coordinates are persisted as exact `Double` strings, not `Float`.
- Removed duplicated scheduler state accessor; scheduler and worker share one `AutoSearchStateStore` schema.
- Worker persists the latest filtered results (up to 100) so results survive process death.
- Added GPS precision regression coverage.
- Re-audited canonical Android source: 41 main Kotlin + 4 test Kotlin files.
- Brace balance: PASS; TODO() count: 0.
- WorkManager/Hilt/serialization dependencies verified in Gradle configuration.
