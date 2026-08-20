# Tests

One folder per API area, following the structure in the
[Altinn Studio Docs](https://docs.altinn.studio/nb/api/). Each folder has its own README
describing what the tests cover and what test data they need, a `run-all.js` that runs every
test in the folder once, and the `functional.yaml` / `smoke.yaml` / `breakpoint.yaml` profiles
used when the tests run scheduled in Kubernetes.

- `access-management` covers the Access Management APIs (enduser, resource-owner, metadata,
  altinn-apps and consent).
- `access-management-bff` covers the BFF the Access Management UI talks to.
- `authentication` covers system register, system users and system user requests.
- `authorization` covers the PDP decision endpoint.
- `correspondence`, `dialogporten`, `notifications` and `register` cover those services.
- `portaler` covers the info portal, `platform` covers service owner infrastructure and
  `sanity-checks` verifies that the test rig itself works.

All tests need `ENVIRONMENT` and a base URL, plus `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD`. Anything beyond that is listed in the folder's own README.
