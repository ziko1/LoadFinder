# LoadFinder v26
Real integration-test infrastructure boundary.

Important: tests fail fast unless TESTCONTAINERS_ENABLED=true.
docker-compose.test.yml provides PostgreSQL/PostGIS and Redis test services.
No mock fallback is presented as a real integration test.
