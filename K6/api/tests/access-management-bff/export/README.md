# Delegation export

`delegation-export.js` exports the delegations of a party, which is the heaviest read in the
UI and worth watching on its own.

Test data is read from `access-management-bff/export/<env>/`. Needs `ENVIRONMENT` and
`AM_UI_BASE_URL`.
