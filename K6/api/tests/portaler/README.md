# Portaler

Reads info.altinn.cloud the way a logged in user does. Every page first fetches authorized
parties, favorites and current user, then the page itself, so the labels separate the shared
calls from the page specific one.

- `get-info-dot-altinn-dot-cloud.js` is the front page.
- `-skjemaoversikt.js`, `-starte-og-drive.js` and `-sok.js` are the other pages. The search
  test uses words from `portaler/words.txt`.
- `get-infoportal-api-when-loggedin.js` calls only the API parts.

Test data is `portaler/<env>/userids.csv`, segmented per VU. Needs `ENVIRONMENT` and
`INFO_CLOUD_URL`, for instance `https://info.at23.altinn.cloud`.
