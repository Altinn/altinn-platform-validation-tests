# Be om tilgang

`be-om-tilgang.js` runs the request-for-access flow. Each iteration picks two unique users and
a random access package from the metadata API. The organization first adds user A as a
connection, user A then asks for the package from the organization, and the daglig leder of
that organization approves it.

Test data is `access-management/enduser/request/<env>.csv` and needs both the pid and the last
name, since adding the connection requires both. Needs `ENVIRONMENT` and `BASE_URL`. Live runs
leave real assignments behind.
