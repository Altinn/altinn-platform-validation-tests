# Resource Registry test data

Read in `setup` by the [resource-registry tests](../../api/tests/resource-registry/README.md), one file per
environment, since party ids and uuids differ between environments. The files are fetched over HTTP from `main`, so a
change takes effect when it is merged; for a local run against a branch, set `TESTDATA_BRANCH=<branch>`. A missing
or empty file fails the test in `setup`.

## Files

| File | Rows | Columns | Used for |
| --- | --- | --- | --- |
| `resources-<env>.csv` | 2 | `owner,ownerOrgNo,resourceId,actions` | The resources the tests connect lists to, with the org that owns them and the actions of their policy; each iteration picks one row. See [Resources](../../api/tests/resource-registry/README.md#resources). |
| `organizations-<env>.csv` | 20 AS + 20 ENK | `orgNo,partyId,partyUuid,unitType` | Members of the access lists. `orgNo` is what the tests send; `partyId` and `partyUuid` are the Altinn party Register resolves it to, which the tests check; `unitType` is `AS` or `ENK`, the field as Register and Profile name it. |

## Regenerating the files

**Resources.** Pick a resource the owner org has in the environment, with access lists disabled so a connection made
by a test grants nobody anything, and list the actions its policy grants with `actions` separated by `;`.
`GET /resourceregistry/api/v2/resource/{id}/policy/rights` shows the actions. `owner` is the org code and
`ownerOrgNo` its organization number; the enterprise token is issued for them.

**Organizations.** Twenty `AS` and twenty `ENK` per environment: search Tenor for synthetic organizations of that
form, look each organization number up in Register in that environment, and leave out the ones Register does not
know. `orgNo` is Tenor's `organisasjonsnummer`; `partyId`, `partyUuid` and `unitType` are the party's fields of the
same name from Register. Tenor holds the same organizations everywhere, so the same organization numbers can show up
in more than one environment's file; only the party ids and uuids differ.
