# LoadFinder v40

Search correctness and notification hardening.

Changes:
- Repository rethrows coroutine CancellationException instead of converting cancellation into a retry/failure.
- Search now applies vehicle type and destination filters in the repository, not only in Match Score.
- Auto Search notifies only for new load IDs compared with the persisted result set.
- Added local notification channel and FCM data-message handling.
- Added regression coverage for destination + vehicle filtering.
- Full canonical Android audit: 42 main Kotlin files, 6 test Kotlin files.
- `TODO()` occurrences: 0.
- Brace balance: PASS.
- Legacy duplicate Android source tree: absent.
- Hard-coded secret pattern scan: 0 hits.
