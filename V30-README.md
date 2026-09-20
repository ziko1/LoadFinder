# LoadFinder v30

Build-first correction pass.

Fixed:
- backend `build` now emits `dist`, matching `start`;
- CI uses `npm install` because the repository has no package-lock.json;
- Android unit test moved into the actual `:app` module source set.

Verification:
- source/package/CI structural audit: PASS
- npm install was attempted in the environment but timed out, so TypeScript compilation was NOT claimed as executed;
- Android Gradle build was NOT claimed as executed without a working Gradle/SDK environment.
