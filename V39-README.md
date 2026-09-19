# LoadFinder v39

Auto Search result-to-UI and settings precision hardening.

Changes:
- SearchSettingsStore now persists decimal settings as strings without Float truncation.
- Added backward-compatible migration for v38-and-earlier Float-backed SharedPreferences.
- HomeViewModel hydrates persisted Auto Search results at startup.
- HomeScreen refreshes persisted results on lifecycle resume.
- Added regression contract coverage for decimal settings.
- Existing Worker result persistence and retry behavior retained.

Verification:
- Canonical Android source audit: PASS.
- Main Kotlin files: verified.
- Test Kotlin files: verified.
- TODO() markers: 0.
- Brace balance: PASS.
- Legacy android/app/src tree: absent.
- WorkManager/Hilt/lifecycle/serialization dependency declarations: PASS.
- Full Gradle/APK build is not claimed because Android SDK/Gradle are unavailable in this environment.
