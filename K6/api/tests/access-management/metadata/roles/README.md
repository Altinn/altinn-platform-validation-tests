# Metadata, roles

Read only tests against the role catalogue.

- `get-roles.js` lists all roles.
- `get-role-with-id.js` fetches a single known role by id.
- `get-roles-packages.js` fetches the access packages of a role (revisor).
- `get-resources.js` fetches the resources tied to a role.

No test data files, the expected roles are hardcoded. Needs `ENVIRONMENT` and `BASE_URL`.
