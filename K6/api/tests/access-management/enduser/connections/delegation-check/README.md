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
| [bostyrer-checks-konkursbo-access-packages.js](bostyrer-checks-konkursbo-access-packages.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_BOBE_Role_idFilter` | Bostyrer of a konkursbo | `party`, `packageIds` |

`daglig-leder-checks-delegable-access-packages.js` checks that the answer covers access
packages, that none of the packages only a person can hold (`innbygger-*` and `vergemal-*`)
are offered for the organization, that `eksplisitt` cannot be delegated, and that
`post-til-virksomheten-med-taushetsbelagt-innhold` can.

`bostyrer-checks-konkursbo-access-packages.js` filters on the ids of
`konkursbo-skrivetilgang` and `konkursbo-lesetilgang`. It checks that only those two are
returned, and that the bostyrer can delegate both because the bostyrer role gives them
(reason `Direct-RolePackage`). The Bruno test only checks the first item in the response,
whichever package that is.

## Test data

Each test draws one row per iteration from a fixture in
`K6/testdata/access-management/enduser/connections/delegation-check/`. The Bruno tests use one
fixed party each; these are random parties from Tenor that exist in Register for the
environment. Tenor returns random hits, so running a command again gives other rows.

The files were made with testudo on 2026-11-24, from `helpers/testudo`, with the commands
below.

**`organizations/<environment>.csv`**: an AS and its daglig leder.

```bash
for env in at22 tt02; do
  go run . find organizations --unit-type AS --count 10 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid \
    --out ../../K6/testdata/access-management/enduser/connections/delegation-check/organizations/$env.csv
done
```

**`konkursbo/<environment>.csv`**: a konkursbo (`KBO`) and its bostyrer. testudo takes the
bostyrer as the leader of a konkursbo.

```bash
for env in at22 tt02; do
  go run . find organizations --unit-type KBO --count 10 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid \
    --out ../../K6/testdata/access-management/enduser/connections/delegation-check/konkursbo/$env.csv
done
```

## Running

```
k6 run K6/api/tests/access-management/enduser/connections/delegation-check/bostyrer-checks-konkursbo-access-packages.js
```

`ENVIRONMENT` and `BASE_URL` are required. `ENVIRONMENT` also picks the test data file, so it
has to be `at22` or `tt02`.
