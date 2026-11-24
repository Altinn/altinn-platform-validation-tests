# Delegation check as end user

Ported from the Bruno suite at
[EnduserAPI/Connections/DelegationCheck](https://github.com/Altinn/altinn-auth/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/EnduserAPI/Connections/DelegationCheck)
in altinn-auth.

The delegation check tells an end user which access packages they can delegate on behalf of
a party. Each test authenticates as an end user, runs the check for a party, and asserts what
the user can and cannot delegate.

| Test | Bruno test | Authenticates as | Query |
| --- | --- | --- | --- |
| [daglig-leder-checks-delegable-access-packages.js](daglig-leder-checks-delegable-access-packages.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_Dagl_NoFilter` | Daglig leder of an AS | `party` only |

`daglig-leder-checks-delegable-access-packages.js` checks that the answer covers access
packages, that none of the packages only a person can hold (`innbygger-*` and `vergemal-*`)
are offered for the organization, that `eksplisitt` cannot be delegated, and that
`post-til-virksomheten-med-taushetsbelagt-innhold` can.

## Test data

The tests draw one row per iteration from
`K6/testdata/access-management/enduser/connections/delegation-check/organizations/<environment>.csv`:
an AS and its daglig leder. The Bruno test uses one fixed organization; these are random AS
organizations from Tenor that exist in Register for the environment.

The files were made with testudo on 2026-11-24, from `helpers/testudo`, with this command:

```bash
for env in at22 tt02; do
  go run . find organizations --unit-type AS --count 10 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid \
    --out ../../K6/testdata/access-management/enduser/connections/delegation-check/organizations/$env.csv
done
```

Tenor returns random hits, so running the command again gives other rows.

## Running

```
k6 run K6/api/tests/access-management/enduser/connections/delegation-check/daglig-leder-checks-delegable-access-packages.js
```

`ENVIRONMENT` and `BASE_URL` are required. `ENVIRONMENT` also picks the test data file, so it
has to be `at22` or `tt02`.
