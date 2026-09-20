# LoadFinder v9

## Real map
Google Maps Compose screen:
- live vehicle marker
- pickup/delivery markers
- 100 km search circle
- route line
- automatic camera movement with GPS
- Next Load button

A Google Maps API key and Google Cloud configuration are required.

## Navigation
The app can hand off navigation to the installed Google Maps Android app.

## TIMOCOM
Added a provider adapter and unified exchange boundary without inventing undocumented endpoints.
Actual authenticated TIMOCOM REST calls must be filled from the approved API access for the account.

## Production
Persist GPS in Postgres/PostGIS, use road routing for ETA/distance, persist FCM tokens, authenticate every request, and finish the TIMOCOM client after API credentials are available.
