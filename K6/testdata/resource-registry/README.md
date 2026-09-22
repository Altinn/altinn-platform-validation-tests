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

Two steps: fetch businesses with the Tenor CLI in `altinn-access-management-frontend`, then look them up in Register
with the script in this repository. Tenor needs a Maskinporten client with the scope
`skatteetaten:testnorge/testdata.read`; the frontend team has one, and its `MASKINPORTEN_CLIENT_ID` and
`MASKINPORTEN_JWK` go in the frontend repository's gitignored `playwright/config/.env`.

From `altinn-access-management-frontend/playwright`, per environment:

```sh
yarn tenor virksomheter -n 20 --env at23 --json > tenor-AS-at23.json
yarn tenor virksomheter -n 20 --kql "organisasjonsform.kode:ENK" --env at23 --json > tenor-ENK-at23.json
```

Then from this repository, with the environment's `.conf/<env>.ps1` loaded and `REGISTER_SUBSCRIPTION_KEY` set to the
Register APIM key for that environment:

```sh
node hack/tenor-to-testdata.mjs --env at23 --out K6/testdata/resource-registry/businesses-at23.csv tenor-AS-at23.json tenor-ENK-at23.json
```

The script asks Register for every organization number (platform access token from the test token generator plus the
subscription key), takes `partyId`, `partyUuid` and `unitType` from the answer, drops businesses Register does not know
and says how many, and refuses to write an empty file. Do the same for at22 and tt02.

The Tenor CLI has a `--register` flag that does the Register lookup itself, but it asks for a field Register does not
accept (`organization`; Register wants `org`) and fails with a 400 at the time of writing. The script here is the
workaround until that is fixed in the frontend repository.
