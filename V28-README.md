# LoadFinder v28
CI build/test wiring.

Fix from audit: v24-v27 tests imported Vitest but backend/package.json did not declare Vitest. v28 adds Vitest and test scripts.
CI uses npm install because the repository currently has no package-lock.json; once a lockfile is committed, switch CI to npm ci.
Android CI uses a pinned Gradle 8.10 distribution because the repository does not currently contain gradlew/wrapper files.
Runtime integration tests still require Docker/Testcontainers execution in CI.
