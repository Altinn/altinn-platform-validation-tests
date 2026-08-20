# Connections

Reads the connection graph as an end user, one test per direction so the summary keeps the
two apart.

- `get-connections-from.js` and `get-connections-to.js` list connections where the party is
  the giver and the receiver respectively.
- `get-access-packages-from.js` and `get-access-packages-to.js` do the same for access packages.

Test data is `access-management/enduser/connections/<env>.csv` with organizations and the user
id used to get a token. It is segmented per VU. Needs `ENVIRONMENT` and `BASE_URL`.
