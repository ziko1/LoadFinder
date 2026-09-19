# LoadFinder v35

Reliability hardening and regression checks.

- MatchScoreCalculator now guards against zero/near-zero radius and max-empty-distance settings.
- LoadRepository isolates exchange adapter failures so one provider cannot suppress all other results.
- Added a regression test for zero-limit scoring.
- Re-audited backend relative imports: 0 unresolved.
- Android Gradle build was not claimed because this environment has Java but no Gradle/Android SDK toolchain.
