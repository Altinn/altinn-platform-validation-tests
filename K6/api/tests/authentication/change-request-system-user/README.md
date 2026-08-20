# Change requests on system users

`create-and-approve-change-request.js` arranges an approved system user, then asks for more
rights on it as the vendor. It checks that a right the system user does not have can be asked
for, that asking again with the same correlation id returns the same change request instead of
a new one, and that the customer can approve the change. The system user and system are deleted
at the end.

Test data is `authentication/change-request-system-user/vendors.csv` and
`end-users-<env>.csv`. Needs `ENVIRONMENT`, `BASE_URL` and `AM_UI_BASE_URL`.
