# Access packages

Delegating access packages through the BFF, the way the UI does it.

- `org-to-org.js` connects two organizations, delegates a package, adds an agent and a client,
  reads the permissions back, and cleans up after itself.
- `user-to-user.js` is the shorter person to person version of the same flow.

Test data is `access-management-bff/access-packages/org-to-org/<env>.csv` and
`user-to-user/<env>.csv`. Needs `ENVIRONMENT` and `AM_UI_BASE_URL`. Runs create and delete real
delegations.
