# Enduser requests for single rights (v2)

Tests for the v2 enduser request endpoints that take right keys:
`POST v2/enduser/request/resource` with `requestedRightKeys` and
`PUT v2/enduser/request/received/approve` with `rightKeys`.

| Test | Flow |
| --- | --- |
| `be-om-enkeltrettighet.js` | a person asks an organization for read and write on the resource, the daglig leder approves read only, and the stored request says `PartialApprove` with read approved |

The resource is `ttd-enkeltrettigheter-rightkeys`, provisioned in AT22, AT23
and TT02 with the same policy. The right keys the request endpoints take are the
`right.key` hashes the delegation check reports, not the action names and not the
`rightKey` from the resource registry's policy/rights; setup reads them once from
the delegation check.

Validation cases (400 and 403, approving twice, unknown keys) are covered by
unit tests in Authorization and are not run from here. See
[issue 721](https://github.com/Altinn/altinn-platform-validation-tests/issues/721).

## Test data

One fixture per environment, the same shape as `enduser/request`: a daglig
leder and the organization they lead, 500 rows each for AT22, AT23 and TT02.

```
K6/testdata/access-management/enduser/request-v2/<env>.csv
  pid,partyUuid,userId,partyId,lastName,orgUuid,orgNo
```

Each iteration draws two unique rows with `pickUnique`: one acts as a person
for themselves, the other as daglig leder of their organization. The rows come
from Tenor through the `tenor` CLI in `altinn-access-management-frontend/playwright`,
with Altinn ids looked up in Register per environment. Rows without a user id
are left out, since the token needs it for the person to act.

`fetchTestData` reads from `main`, so until this branch is merged `common.js`
points at the fixture on the branch by full URL. Switch it back to the relative
path when merging. `TEST_DATA_BASE_URL` overrides the base path either way.

```sh
k6 run K6/api/tests/access-management/enduser/request-v2/be-om-enkeltrettighet.js --iterations 1 --vus 1
```

## Flow

Each iteration arranges and cleans up after itself, like `be-om-tilgang.js`:
the organization adds the person as a connection first, and removes it again
with cascade at the end, so the right the approval delegated goes with it. The
right keys are read once in setup from the delegation check.

After the approval the test asks the decision point (`/authorization/api/v1/authorize`)
whether the person may read and write for the organization, as a service would.
Read must be `Permit` and write, which was asked for but not approved,
`NotApplicable`. The decision point sits behind API management, so a run in k8s
needs the `authorization-subscription-key-<env>` secret. There is none for AT23,
so the test cannot run there.
