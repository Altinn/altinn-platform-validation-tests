# Authorized parties as end user

Ported from the Bruno suite at
[AsEndUser_authParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/auth_parties_Hovedenhet_Underenhet/AsEndUser_authParties).

Each test authenticates as the recipient of a delegation and asserts that the delegating
party shows up in the authorized parties list with exactly the access the query asks for.
The parties themselves live in `testdata-<environment>.json`, while the delegated access
packages, resources and instances are hardcoded in the test files.

| Test | Delegation | Authenticates as | Query |
| --- | --- | --- | --- |
| `person-b-sees-person-a.js` | Person A to person B | Person B | `includeRoles=false`, `includeAccessPackages=true` |
| `dagligleder-a-sees-person-a.js` | Person A to hovedenhet A | Daglig leder A | `includeResources=true` |
| `person-c-sees-hovedenhet-a.js` | Hovedenhet A to person C | Person C | `includeInstances=true` |
| `dagligleder-b-sees-hovedenhet-a.js` | Hovedenhet A to hovedenhet B | Daglig leder B | `includePartiesViaKeyRoles=true` |
| `dagligleder-c-sees-hovedenhet-a.js` | Hovedenhet A to underenhet C | Daglig leder C | `anyOfResourceIds`, `partyFilter` |
| `dagligleder-b-sees-underenhet-c.js` | Underenhet C to hovedenhet B | Daglig leder B | `includeRoles`, `includeAccessPackages`, `includeResources` |
| `dagligleder-c-sees-underenhet-d.js` | Underenhet D to underenhet C | Daglig leder C | all four include filters |
| `person-a-sees-underenhet-d.js` | Underenhet D to person A | Person A | `partyFilter`, `includeInstances=true` |

`dagligleder-c-sees-hovedenhet-a.js` and `dagligleder-c-sees-underenhet-d.js` are skipped
by a `skipDueToKnownBug` flag, matching the Bruno suite. Flip the flag once the bug is
fixed.

## Running

```
k6 run K6/api/tests/access-management/enduser/person-b-sees-person-a.js
```

`ENVIRONMENT` and `BASE_URL` are required. `ENVIRONMENT` also picks the test data file, so
it has to match one of the `testdata-<environment>.json` files.
