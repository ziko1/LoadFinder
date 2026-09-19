# LoadFinder v34

Dependency/build reproducibility hardening on top of v33.

Changes:
- Declared npm package manager version `npm@10.9.2`.
- Added `npm run preflight` to fail clearly when declared dependencies are not installed.
- Production build now runs the dependency preflight before `tsc`.
- CI runs the same preflight before build.
- Added `.dockerignore` for local build artifacts and dependencies.
- Kept Docker build aligned with the production npm build.
- Re-audited all relative TypeScript imports: 0 unresolved.

Verification:
- Node: 22.16.0
- npm: 10.9.2
- TypeScript available globally: 5.8.3
- Dependency preflight: FAIL in this sandbox because npm dependencies are not installed.
- `tsc -p tsconfig.build.json --noEmit`: FAIL for the same missing dependency/type packages.
- `npm install --no-audit --no-fund` was actually attempted and timed out; no dependency-clean compile is claimed.
