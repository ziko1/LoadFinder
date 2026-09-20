# LoadFinder v32

Production-build graph hardening.

Changes:
- `npm run build` now uses `tsconfig.build.json`.
- Production TypeScript compilation is rooted at `src/server.ts`; imported runtime files are followed automatically.
- Test files are excluded from the production compiler and remain covered by `npm test`.
- `/health` no longer reports the stale historical `v21`; it reports `APP_VERSION` or package version `0.4.0`.
- Full relative-import audit: 0 unresolved imports.
- Runtime import closure from `server.ts`: 44 TypeScript files.

Verification:
- TypeScript compiler was actually invoked.
- This environment does not have backend npm dependencies installed; the compiler therefore cannot reach a dependency-clean PASS here.
- The exact compiler output is preserved in `backend/v32-build-check.txt`.
