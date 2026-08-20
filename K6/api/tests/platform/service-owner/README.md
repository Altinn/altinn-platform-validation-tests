# Service owner infrastructure

Checks every service owner org in the environment, one iteration per org.

- `healthcheck.js` calls the kuberneteswrapper deployments endpoint and checks the status code,
  the HTTP version and the body.
- `ipv4-test.js` and `ipv6-test.js` resolve the org's domain and check that the address it
  returns is valid.
- `tls-valid.js` checks the certificate on the org's domain.

Needs `DEPLOY_ENV`. The org list comes from the client, not from a test data file.
