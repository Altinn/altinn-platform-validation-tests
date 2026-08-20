# PDP authorize

Asks the PDP for a decision and asserts both the Permit and the matching Deny, so a test
cannot pass just because everything is allowed.

- `dagl.js` and `dagl-single-resource.js` ask as daglig leder, on all resources and on one.
- `dagl-direct-delegation.js` asks for a right that was delegated directly rather than through
  the role.
- `dagl-deny.js` only asks for the cases that should be denied.
- `enduser.js` asks as a person for their own access.
- `enduser-enduser-instances.js` and `org-enduser-instances.js` ask about instance delegations,
  person to person and organization to person.

Test data is per test under `authorization/pdp-authorize/`, most of it
`orgs-dagl-<env>.csv`, `dagl-single-resource/single-rights-<env>-v2.csv` and the instance
delegation CSVs under `<env>/`. Needs `ENVIRONMENT`, `BASE_URL` and
`AUTHORIZATION_SUBSCRIPTION_KEY`.
