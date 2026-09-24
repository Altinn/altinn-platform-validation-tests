# Resource Registry test data

Read by the [resource-registry tests](../../api/tests/resource-registry/README.md). The conventions shared by every
folder here are in [the test data README](../README.md).

## Files

| File | Rows | Columns | Used for |
| --- | --- | --- | --- |
| `resources-<env>.csv` | 2 | `owner,ownerOrgNo,resourceId,actions` | The resources the tests connect lists to, with the org that owns them and the actions of their policy; each iteration picks one row. See [Resources](../../api/tests/resource-registry/README.md#resources). |
| `organizations-<env>.csv` | 20 AS + 20 ENK | `orgNo,partyId,partyUuid,unitType` | Members of the access lists. `orgNo` is what the tests send; `partyId` and `partyUuid` are the Altinn party Register resolves it to, which the tests check; `unitType` is `AS` or `ENK`, the field as Register and Profile name it. |

The organizations are synthetic ones from Tenor, so the same organization numbers can show up in more than one
environment's file; only the party ids and uuids differ.

## Regenerating the organizations

From `altinn-access-management-frontend/playwright`, per environment:

```sh
yarn tenor virksomheter -n 20 --env at23 --register --json > tenor-AS-at23.json
yarn tenor virksomheter -n 20 --kql "organisasjonsform.kode:ENK" --env at23 --register --json > tenor-ENK-at23.json
```

Each row maps onto the CSV as `organisasjonsnummer` → `orgNo`, `altinn.partyId` → `partyId`, `altinn.partyUuid` →
`partyUuid`, `altinn.unitType` → `unitType`. Rows with `altinn: null` (Register does not know the organization) are
left out.

At the time of writing, `--register` fails with a 400 because the CLI asks Register for a field it does not accept
(`organization`; Register wants `org`). The current files were built from the same Tenor output with the Register
lookup done separately.
