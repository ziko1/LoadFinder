# LoadFinder v17 — verified production auto-search foundation

v17 fixes the persistence gap discovered during the v16 review: v15/v16 referenced
`load_snapshots`, `auto_search_state`, `auto_search_runs`, `driver_search_positions`
and `load_notifications` without a complete migration.

## Pipeline
GPS position -> persistent driver position -> due scheduler -> Redis queue ->
exchange search -> ranking/profit -> load snapshot -> reliable notification -> run audit.

## Safety
Auto-bid/accept remains separate and confirmation-gated. v17 does not enable live
contractual actions.

## Verification
Run the repository audit first. Then, in an environment with npm dependencies:
`npm run build` and integration tests against PostgreSQL/PostGIS + Redis.
