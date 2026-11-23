# Authorized parties as end user

Ported from the Bruno suite at
[AsEndUser_authParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/auth_parties_Hovedenhet_Underenhet/AsEndUser_authParties).

Each test authenticates as the recipient of a delegation and asserts that the delegating
party shows up in the authorized parties list with exactly the access the query asks for.
The parties themselves live in `testdata-<environment>.json`, while the delegated access
packages, resources and instances are hardcoded in the test files.

The test name in the table below is the k6 group label the scenario reports under, which
is what shows up in the summary output and in the Slack message.

| Test | Delegation | Authenticates as | Query |
| --- | --- | --- | --- |
| `Person-B-får-person-A-i-aktørlista` | Person A to person B (P2P) | Person B | `includeRoles=false`, `includeAccessPackages=true` |
| `dagl-A-får-person-A-i-aktørlista` | Person A to hovedenhet A (P2H) | Daglig leder of hovedenhet A | `includeResources=true` |
| `Person-C-får-hovedenhet-A-i-aktørlista` | Hovedenhet A to person C (H2P) | Person C | `includeInstances=true` |
| `dagl-B-får-hovedenhet-A-i-aktørlista` | Hovedenhet A to hovedenhet B (H2H) | Daglig leder of hovedenhet B | `includePartiesViaKeyRoles=true` |
| `dagl-av-underenhet-får-hovedenhet-A-i-aktørlista` | Hovedenhet A to underenhet C (H2U) | Daglig leder of hovedenhet C | `anyOfResourceIds`, `partyFilter` |
| `dagl-B-får-underenhet-C-i-aktørlista` | Underenhet C to hovedenhet B (U2H) | Daglig leder of hovedenhet B | `includeRoles`, `includeAccessPackages`, `includeResources` |
| `dagl-C-får-underenhet-D-i-aktørlista` | Underenhet D to underenhet C (U2U) | Daglig leder of hovedenhet C | all four include filters |
| `Person-A-får-underenhet-D-i-aktørlista` | Underenhet D to person A (U2P) | Person A | `partyFilter`, `includeInstances=true` |

The file names are the group labels transliterated, so `å` becomes `aa` and `ø` becomes
`oe`. `dagl-av-underenhet-får-hovedenhet-A` and `dagl-C-får-underenhet-D` are skipped by a
`skipDueToKnownBug` flag, matching the Bruno suite. Flip the flag once the bug is fixed.

## ADOS subunit inheritance

`dagl-av-hovedenhet-får-ADOS-underenhet-i-aktørlista`
([dagl-av-hovedenhet-faar-ados-underenhet-i-aktoerlista.js](dagl-av-hovedenhet-faar-ados-underenhet-i-aktoerlista.js))
is ported from the Bruno test
[01_WHEN_TheAdosMainUnitDailyLeaderListsAuthorizedParties](https://github.com/Altinn/altinn-auth/blob/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/AuthorizedParties/EnduserAuthorizedParties/10_AdosSubunitInheritance/01_WHEN_TheAdosMainUnitDailyLeaderListsAuthorizedParties.bru)
in altinn-auth.

An ADOS unit (administrativ enhet - offentlig sektor) belongs to another organization,
often a kommune, through the role `ADOS` in Enhetsregisteret. With the feature flag
`AccessManagement.Subunit.AdosInheritance` on, Access Management treats the ADOS unit as a
subunit of that organization, the same way as BEDR and AAFY. The test authenticates as the
daglig leder of the hovedenhet, lists authorized parties with `includeSubParties=true` and
`includeRoles=true`, and checks that the hovedenhet is returned with the ADOS unit nested
under it. No delegation is involved; the access comes from the key role alone.

The test draws one row per iteration from
`K6/testdata/access-management/enduser/authorized-parties/ados-subunits/<environment>.csv`.
The files were made with testudo on 2026-11-23, from `helpers/testudo`, with this command:

```bash
for env in at22 tt02; do
  go run . find organizations --unit-type ADOS --count 10 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,hovedenhetUnitType,ssn,userId,userPartyId,userPartyUuid \
    --out ../../K6/testdata/access-management/enduser/authorized-parties/ados-subunits/$env.csv
done
```

`--unit-type ADOS` gives each ADOS unit with the organization in its `ADOS` role as the
hovedenhet, and the daglig leder of that organization as the person. Tenor returns random
hits, so running the command again gives other rows.

## Running

```
k6 run K6/api/tests/access-management/enduser/person-b-faar-person-a-i-aktoerlista.js
```

`ENVIRONMENT` and `BASE_URL` are required. `ENVIRONMENT` also picks the test data file, so
it has to match one of the `testdata-<environment>.json` files.
