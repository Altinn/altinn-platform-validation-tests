# System register

As a system vendor, register and maintain a system.

- `system-register-crud.js` registers a system, verifies it, replaces its rights and access
  packages, checks that every change landed in the change log, deletes it and checks it is gone.
- `system-register-rights.js` registers a system with two rights and reads them back as an end
  user.
- `system-register-access-packages.js` does the same for access packages.

No test data files, the systems are generated and deleted by the tests themselves. Needs
`ENVIRONMENT` and `BASE_URL`.
