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
| [daglig-leder-checks-access-packages-by-id.js](daglig-leder-checks-access-packages-by-id.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_Dagl_IdFilter` | Daglig leder of an AS | `party`, `packageIds` |
| [daglig-leder-checks-access-packages-by-urn.js](daglig-leder-checks-access-packages-by-urn.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_Dagl_UrnFilter` | Daglig leder of an AS | `party`, `packages` |
| [daglig-leder-checks-access-packages-by-id-and-urn.js](daglig-leder-checks-access-packages-by-id-and-urn.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_Dagl_UrnIdFiltr` | Daglig leder of an AS | `party`, `packageIds`, `packages` |
| [daglig-leder-checks-access-packages-through-key-role.js](daglig-leder-checks-access-packages-through-key-role.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_KeyRole` | Daglig leder of an AS that is tilgangsstyrer for another AS | `party` only |
| [bostyrer-checks-konkursbo-access-packages.js](bostyrer-checks-konkursbo-access-packages.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_BOBE_Role_idFilter` | Bostyrer of a konkursbo | `party`, `packageIds` |
| [regnskapsforer-checks-regnskapsforer-packages-for-client.js](regnskapsforer-checks-regnskapsforer-packages-for-client.js) | `GET_Enduser_Conn_AccPcks_DelgCheck_REGN_Role_idFilter` | Leader of a regnskapsfører, for one of its clients | `party`, `packageIds` |

`daglig-leder-checks-delegable-access-packages.js` checks that the answer covers access
packages, that none of the packages only a person can hold (`innbygger-*` and `vergemal-*`)
are offered for the organization, that `eksplisitt` cannot be delegated, and that
`post-til-virksomheten-med-taushetsbelagt-innhold` can.

`daglig-leder-checks-access-packages-by-id.js` filters on the ids of `klientadministrator`,
`post-til-virksomheten-med-taushetsbelagt-innhold` and `regnskapsforer-lonn`. It checks that
only those three are returned, that the daglig leder can delegate the first two, which the
role gives, and that they cannot delegate `regnskapsforer-lonn`, which only comes with the
regnskapsfører role. It uses the same organizations as the test without a filter.

`daglig-leder-checks-access-packages-by-urn.js` filters on `packages` with both forms the API
accepts: the codes `hovedadministrator` and `barnehageleder`, and the full urn
`urn:altinn:accesspackage:eksplisitt`. It checks that only those three are returned, that the
daglig leder can delegate the first two, and that `eksplisitt` cannot be delegated. It uses
the same organizations as the test without a filter.

`daglig-leder-checks-access-packages-by-id-and-urn.js` filters on the ids of
`klientadministrator`, `veitransport` and `regnskapsforer-lonn`, and on the urns of
`hovedadministrator`, `barnehageleder` and `eksplisitt`. The two filters add up, so it checks
that all six and nothing else are returned, that the daglig leder can delegate the four the
role gives, and that `regnskapsforer-lonn` and `eksplisitt` cannot be delegated. It uses the
same organizations as the test without a filter.

`daglig-leder-checks-access-packages-through-key-role.js` is the only test here that writes
data. In `setup()` it draws two organizations from the same fixture as the tests above, and
the daglig leder of the first delegates `tilgangsstyrer` to the second. The daglig leder of
the second then reaches the first only through their key role. The test runs the check for the
first organization, and checks that it answers with the same packages as for the daglig
leder's own organization. `teardown()` removes the connection with the package. The Bruno
test asserts a fixed count instead (147 today), which changes whenever a package is added.

Two things found while porting it:

- An ordinary package such as `motorvognavgift` only gives access to the party. The check
  then answers `403`; it takes `tilgangsstyrer` to run it on the party's behalf. The Bruno
  fixture's `client_rightholderOrg1` has delegated `tilgangsstyrer` too.
- Access Management caches a `403` for a user and a party for up to about a minute. A check
  made before the delegation, or a failed run with the same pair less than a minute earlier,
  can make the test fail. The test makes no check before the delegation.

`bostyrer-checks-konkursbo-access-packages.js` filters on the ids of
`konkursbo-skrivetilgang` and `konkursbo-lesetilgang`. It checks that only those two are
returned, and that the bostyrer can delegate both because the bostyrer role gives them
(reason `Direct-RolePackage`). The Bruno test only checks the first item in the response,
whichever package that is.

`regnskapsforer-checks-regnskapsforer-packages-for-client.js` also writes data. In `setup()`
it draws a regnskapsfører, and the leader of one of its clients makes the regnskapsfører
tilgangsstyrer for the client; `teardown()` removes it. Being the client's regnskapsfører is
not enough to run the delegation check for the client: it answers `403` without the
`tilgangsstyrer` delegation. The test filters on the ids of
`regnskapsforer-med-signeringsrettighet` and `regnskapsforer-uten-signeringsrettighet`, and
checks that only those two are returned and that the regnskapsfører's leader can delegate
neither (reason `NoAccess`). The Bruno test only checks the first item in the response. The
Bruno fixture's `klient_org_other` gives the same answer, so it has presumably made its
regnskapsfører tilgangsstyrer already.

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

**`regnskapsforere/<environment>.csv`**: a regnskapsfører and its leader (daglig leder, or
innehaver of an ENK), one of its clients, and the client's leader (daglig leder, innehaver or
styreleder). testudo finds a regnskapsfører through a client that has it as `REGN` in
Enhetsregisteret, and the `client…` columns describe that client. at22 got 9 rows, since one
client's leader had no user and testudo left that row out.

```bash
for env in at22 tt02; do
  go run . find organizations --role regnskapsfoerer --count 10 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid,clientOrganizationIdentifier,clientPartyUuid,clientPersonRole,clientSsn,clientUserId,clientUserPartyId,clientUserPartyUuid \
    --out ../../K6/testdata/access-management/enduser/connections/delegation-check/regnskapsforere/$env.csv
done
```

## Running

```
k6 run K6/api/tests/access-management/enduser/connections/delegation-check/bostyrer-checks-konkursbo-access-packages.js
```

`ENVIRONMENT` and `BASE_URL` are required. `ENVIRONMENT` also picks the test data file, so it
has to be `at22` or `tt02`.
