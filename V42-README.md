# LoadFinder v42 — Notification Reliability Hardening

Built from verified v41.

Changes:
- Auto Search now marks load IDs as seen only after notification dispatch returns successfully.
- Extracted notification candidate filtering into `NotificationCandidatePolicy`.
- Candidate policy rejects blank IDs, rejects already-seen IDs, and removes duplicate IDs within one search result.
- Added a regression test for the policy API.
- Preserved v41 durable 5000-ID history and all previous cancellation/formatting protections.

Verification:
- Re-opened and inspected v41 before modification.
- Re-ran project-wide Kotlin/TS/KTS brace checks.
- TODO() scan.
- legacy Android tree scan.
- package-aware duplicate class scan.
- hard-coded secret pattern scan.
- durable seen-ID wiring scan.
- post-dispatch markSeen ordering scan.
- candidate-policy wiring scan.
- ZIP integrity check.

No Android Gradle/runtime success is claimed unless the required Android toolchain is actually available.
