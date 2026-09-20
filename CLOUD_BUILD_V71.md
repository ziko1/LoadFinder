# LoadFinder v71 — Cloud Android Build

This release adds a GitHub Actions workflow for building LoadFinder without a local PC build environment.

## Required one-time step

No local Gradle installation or wrapper is required for the GitHub build. The workflow installs Gradle 8.9 through the official Gradle Actions setup action.

The project uses Android Gradle Plugin 8.7.3. Android's compatibility table requires Gradle 8.9 for AGP 8.7, so the workflow pins Gradle 8.9 rather than using a floating version.

A Gradle wrapper may still be added later for reproducible local/IDE builds, but it is not required by this cloud workflow.

## Cloud build

Push the repository to GitHub, then use:
Actions → LoadFinder Android Build → Run workflow.

The workflow:
1. checks out the repository;
2. installs JDK 17;
3. installs Gradle 8.9;
4. verifies the Android project entrypoints;
5. runs `:app:assembleDebug`;
6. runs `:app:testDebugUnitTest`;
7. uploads the debug APK and unit-test reports.

The workflow is fail-closed on missing project files and build/test errors. It does not fabricate an APK.
