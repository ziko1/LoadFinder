# LoadFinder v11 — Consolidated Architecture

## Pipeline
GPS
→ unified search (all configured providers)
→ deduplication
→ empty distance
→ road-distance provider (production)
→ fuel/toll/driver cost
→ profit + EUR/km
→ score
→ unified list
→ manual BID/ACCEPT
→ active route
→ GPS/geofence
→ NEXT LOAD

## Existing work retained
- Trans.eu OAuth and proposal workflow
- Trans.eu negotiate / accept
- Trans.eu callbacks
- accepted-loads workflow
- GPS and driver route state
- profit engine
- Next Load engine
- Google Maps Compose driver screen
- TIMOCOM adapter boundary
- Firebase push boundary

## Provider policy
Provider adapters must use official APIs and credentials. No scraping, CAPTCHA bypass, or invented endpoints.

## Trans.eu
Current official API documentation confirms:
- carrier proposal list/details
- negotiate
- accept
- accepted proposals
- callbacks
The API documentation also states that carrier API negotiation currently covers direct, partner and fixed-route offers; exchange-offer negotiation is done on the Trans.eu platform.

## Production blockers
- authenticated JWT/OIDC
- encrypted OAuth token persistence
- PostgreSQL/PostGIS persistence
- real road routing/ETA
- FCM backend credentials
- approved TIMOCOM API access
- Google Maps key
- integration tests against sandbox/approved provider accounts
