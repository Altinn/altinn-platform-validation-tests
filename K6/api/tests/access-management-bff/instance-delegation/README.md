# Instance delegation

Delegating access to a single instance through the BFF. Each test first creates the dialog to
delegate on, then walks through the same lookups the UI makes about the user before delegating.

- `org-to-user.js` delegates from an organization to a person.
- `user-to-user.js` delegates from a person to a person.

Test data is `access-management-bff/instance-delegation/<env>/org-user.csv` and
`user-user.csv`. Needs `ENVIRONMENT` and `BASE_URL`. Runs create real dialogs and delegations.
