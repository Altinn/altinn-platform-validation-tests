# Single rights

Delegating single rights through the BFF, including the connection, hovedadmin and role
permission lookups the UI makes on the way.

- `org-to-org.js` goes from organization to organization.
- `user-to-user.js` goes from person to person.

Test data is `access-management-bff/single-rights/<env>/org-org.csv` and `user-user.csv`.
Needs `ENVIRONMENT` and `AM_UI_BASE_URL`.
