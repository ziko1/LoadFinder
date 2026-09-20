# Android client

Use the previous LoadFinder Android MVP as the client base.

Next client changes:
- set BASE_URL to backend
- call GET /v1/loads with GPS
- replace MockExchangeAdapter with API repository
- add notification channel
- add map
- add settings screen
- add manual confirmation dialogs
- never put exchange client secrets in the APK
