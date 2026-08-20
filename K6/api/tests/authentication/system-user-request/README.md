# System user requests

- `create-and-confirm-system-user-request.js` registers a system, creates a system user request
  for it, has the customer approve it, and checks that the approved request is accepted.
- `get-system-user-requests-by-system-id.js` and
  `get-agent-system-user-requests-by-system-id.js` list requests by system id and follow the
  next-link pagination.

Test data is `authentication/system-user-request/<env>.csv` with the customers doing the
approving. Needs `ENVIRONMENT`, `BASE_URL` and `AM_UI_BASE_URL`. Runs create real system users.
