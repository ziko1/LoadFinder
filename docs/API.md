# API

GET /health

GET /v1/loads
Query:
lat, lon, radiusKm, minPriceEur, minPricePerKm, maxEmptyKm, minMatchScore, vehicleType

POST /v1/loads/:id/offer
{ "amountEur": 850, "confirmed": true }

POST /v1/loads/:id/accept
{ "confirmed": true }

These endpoints are development/demo endpoints. Production must add authentication, authorization, audit logging, idempotency, rate limits and real exchange adapters.