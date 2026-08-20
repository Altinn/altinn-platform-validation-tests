# Consent in the UI

- `consent-log.js` reads the consent log of a user.
- `consent-requests.js` reads the active consents of a user.
- `consent-log-worst-case.js` and `consent-requests-worst-case.js` do the same for the users
  with the most consent requests, between 100 and 879 of them. They set one threshold per user
  so the summary breaks the numbers out instead of averaging the heaviest user away.

The ordinary tests read `access-management-bff/consent/<env>.csv`. The worst case users are
hardcoded in `commons.js` and only exist in yt01. Needs `ENVIRONMENT` and `AM_UI_BASE_URL`.
