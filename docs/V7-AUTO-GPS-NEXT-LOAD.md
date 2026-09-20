# LoadFinder v7

## New
- GPS-driven auto-search data contract
- profitability calculation
- empty-kilometre calculation
- next-load ranking
- configurable fuel/toll/driver/other costs
- push gateway abstraction
- Firebase Messaging service skeleton
- Android AutoSearch API
- profit card UI

## Algorithm
1. Read current GPS.
2. Search candidate loads.
3. Calculate empty distance from current/next delivery to pickup.
4. Calculate total distance.
5. Calculate EUR/km.
6. Estimate fuel + toll + driver + other costs.
7. Rank candidates.
8. Notify only when a candidate passes configured thresholds.
9. User opens the load and manually confirms BID/ACCEPT.

## Important
The fallback routing provider is deliberately approximate. Replace it with a real routing engine for road distance and ETA before relying on profit calculations commercially.

FCM needs a Firebase project and backend credentials. The sample does not contain credentials.
