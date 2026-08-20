# Authentication

Tests for the system register and the system user APIs, mostly written as vendor flows: a
vendor registers a system, asks a customer for a system user, and the customer approves it.

- `system-register` is CRUD on the system itself.
- `system-user-request` and `change-request-system-user` are the request and approval flows.
- `system-user` reads system users and their pagination.
- `resource-registry` reads the updated resources feed.
