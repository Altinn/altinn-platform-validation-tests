# Consent

The full consent lifecycle from the resource owner and Maskinporten side.

- `post-consent.js` asks a person for a consent, approves it as that person, looks it up as
  Maskinporten, and checks that it shows up in the person's consent log.
- `consent-request-events.js` reads the consent request event feed and follows the next-link
  pagination.
- `lookup.js` looks up an already granted consent as Maskinporten.
- `testdataGeneration/consent-data.js` requests and approves consents so `lookup.js` has
  something to find. It is a data generator, not an assertion test.

Test data is `access-management/consent/consentee-orgs/<env>.csv` (the organizations asking),
`consenter-persons/<env>.csv` (the persons asked), and `lookup/<env>.csv` (consents the lookup
test reads). One file per environment so a run spreads across many parties instead of hammering
one. Needs `ENVIRONMENT`, `BASE_URL` and `AM_UI_BASE_URL`. Live runs create real consents.
