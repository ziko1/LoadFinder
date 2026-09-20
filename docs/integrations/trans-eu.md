# Trans.eu integration notes

Verified against the current public Trans.eu API documentation on 2026-09-17.

- OAuth 2.0 Authorization Code flow is required and uses client credentials issued for the application.
- Proposal details for a carrier are available at:
  `GET /ext/freights-api/v2/freight-proposals/{freight-id}`
- Negotiation uses:
  `PATCH /ext/freights-api/v1/freights/offers/{offer-id}/negotiate`
- Participant-side accepted proposals use:
  `GET /ext/freights-api/v1/freight-proposals/accepted`

The public documentation confirms these resources, but production activation still requires an approved Trans.eu application, client credentials, API key and the scopes/terms applicable to the account. The repository deliberately does not commit such credentials.

Sources:
- https://www.trans.eu/api/general-information/authorization-process/
- https://www.trans.eu/api/freights-section/get-freight-proposal-details/
- https://www.trans.eu/api/freights-section/price-offer-negotiation/
- https://www.trans.eu/api/freights-section/get-accepted-freight-proposals/
