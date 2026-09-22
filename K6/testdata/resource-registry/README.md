# Resource Registry test data

Synthetic businesses from [Tenor](https://skatteetaten.github.io/testnorge-dokumentasjon/), enriched with their Altinn
party from Register in the environment the file is for. The
[resource-registry functional tests](../../api/tests/resource-registry/README.md) add them as access list members.

## Files

| File | Rows | Columns |
| --- | --- | --- |
| `businesses-at22.csv` | 20 AS + 20 ENK | `orgNo,partyId,partyUuid,orgForm` |
| `businesses-at23.csv` | 20 AS + 20 ENK | `orgNo,partyId,partyUuid,orgForm` |
| `businesses-tt02.csv` | 20 AS + 20 ENK | `orgNo,partyId,partyUuid,orgForm` |

- `orgNo`: organization number, what the tests send when they add a member.
- `partyId`, `partyUuid`: the Altinn party Register resolves the organization number to in that environment. The tests
  check that the registry resolves a member to this party.
- `orgForm`: `AS` or `ENK`, as Register reports it (`unitType`). The lifecycle test picks two `AS` and one `ENK`.

Party ids and uuids differ between environments, so a file is only valid for the environment in its name. Tenor's
businesses are the same everywhere, which is why the same organization numbers can show up in more than one file.

## Regenerating

The businesses come from the Tenor CLI in `altinn-access-management-frontend/playwright`, with `--register` so each
row carries its Altinn party from Register. Tenor needs a Maskinporten client with the scope
`skatteetaten:testnorge/testdata.read`; the frontend team has one, and its `MASKINPORTEN_CLIENT_ID` and
`MASKINPORTEN_JWK` go in the frontend repository's gitignored `playwright/config/.env`, next to the
`<ENV>_REGISTER_SUBSCRIPTION_KEY` the enrichment uses.

Per environment:

```sh
yarn tenor virksomheter -n 20 --env at23 --register --json > tenor-AS-at23.json
yarn tenor virksomheter -n 20 --kql "organisasjonsform.kode:ENK" --env at23 --register --json > tenor-ENK-at23.json
```

Each row in the output maps onto the CSV like this. Rows with `altinn: null` (Register does not know the business) are
left out.

| CSV column | Tenor row |
| --- | --- |
| `orgNo` | `organisasjonsnummer` |
| `partyId` | `altinn.partyId` |
| `partyUuid` | `altinn.partyUuid` |
| `orgForm` | `altinn.unitType` |

At the time of writing, `--register` fails with a 400 because the CLI asks Register for a field it does not accept
(`organization`; Register wants `org`). The current files were built from the same Tenor output with the Register
lookup done separately, using `fields=party,org`. Once the CLI is fixed, the mapping above is all that is needed; a
CSV export command in the CLI, like its existing `be-om-tilgang`, would remove the manual step.
