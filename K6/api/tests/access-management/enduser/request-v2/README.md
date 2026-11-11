# Enduser requests for single rights (v2)

Tests for the v2 enduser request endpoints that take right keys:
`POST v2/enduser/request/resource` with `requestedRightKeys` and
`PUT v2/enduser/request/received/approve` with `rightKeys`.

| Test | Flow |
| --- | --- |
| `be-om-enkeltrettighet.js` | a person asks an organization for read and write on the resource, the daglig leder approves read only, and the stored request says `PartialApprove` with read approved |

The resource is `ttd-enkeltrettigheter-rightkeys`, provisioned in AT22, AT23
and TT02 with the same policy, so the right keys are the same everywhere. The
keys are read from the resource registry in setup, since they are opaque.

Validation cases (400 and 403, approving twice, unknown keys) are covered by
unit tests in Authorization and are not run from here. See
[issue 721](https://github.com/Altinn/altinn-platform-validation-tests/issues/721).

## Test data

Two fixtures per environment, so persons and organizations grow independently.
Row i of one is paired with row i of the other.

```
K6/testdata/access-management/enduser/request-v2/
  persons/<env>.csv   pid,partyUuid,userId,partyId,lastName
  orgs/<env>.csv      pid,partyUuid,userId,partyId,lastName,orgUuid,orgNo
```

In `orgs`, the person columns are the daglig leder; `orgUuid` and `orgNo` are
the organization. Both files come from Tenor through the `tenor` CLI in
`altinn-access-management-frontend/playwright`, with Altinn ids looked up in
Register per environment. Rows without a user id are left out, since the token
needs it for the person to act.

`fetchTestData` reads from `main`, so until this branch is merged `common.js`
points at the fixtures on the branch by full URL. Switch it back to the relative
path when merging. `TEST_DATA_BASE_URL` overrides the base path either way, for
a local file server or another branch.

```sh
k6 run K6/api/tests/access-management/enduser/request-v2/be-om-enkeltrettighet.js --iterations 1 --vus 1
```

## Setup and teardown

`setup()` loads both fixtures, splits the pairs per VU, reads the right keys and
has each reachable organization add its person as a rightholder. A request can
only be approved when the person is a rightholder of the organization, and
arranging that in setup keeps the iteration to the flow being measured. Only the
pairs the run can draw are set up: the first rows of each VU's slice, as many as
the VU gets iterations, or every row when the run has no fixed count.

`teardown()` removes those connections again with cascade, so the rights the
approvals delegated go with them. Setup first sweeps the same connections, so a
run that was cut short does not leave the next one stuck.
