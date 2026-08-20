# System users

`get-system-users-by-system-id.js` lists the system users of an existing vendor system and
follows the next-link pagination. The vendor is hardcoded in the test, since it reads from a
system that already exists rather than creating one.

`run-paginated-systemuser-tests.js` runs all the pagination tests in sequence, and
`run-all-system-user-tests.js` runs the create flows as well, keeping each test's setup apart
because the flows no longer have the same shape.

Needs `ENVIRONMENT` and `BASE_URL`.
