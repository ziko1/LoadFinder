# LoadFinder v69 — Gradle bootstrap

The project currently has no `gradlew` wrapper and this execution environment has no system `gradle`.
No APK build is therefore claimed.

On a machine with Gradle installed, generate and commit the wrapper, then run:
- `./gradlew :app:assembleDebug`
- `./gradlew :app:testDebugUnitTest`

Only report the APK as build-verified after those commands actually succeed.
