# testudo

testudo finds test persons and organizations for K6 tests. It searches
[Tenor](https://testdata.skatteetaten.no) (Skatteetaten's synthetic test data),
looks every hit up in Altinn Register for the environment you ask for, and
prints the ones that exist there as text, JSON or CSV. All identifiers in the
output (`partyUuid`, `partyId`, `userId` and so on) come from Register, so a row
works in that environment as it is.

Use it to make the CSV files that K6 tests read in `setup()` with
`fetchTestData()`. [K6/testdata/README.md](../../K6/testdata/README.md) has the
recipe for each file that is made with testudo today.

- [Install](#install)
- [Configuration](#configuration)
- [How it picks parties](#how-it-picks-parties)
- [find persons](#find-persons)
- [find organizations](#find-organizations)
- [Output](#output)
- [Recipes for K6 setup](#recipes-for-k6-setup)
- [What testudo does not do](#what-testudo-does-not-do)
- [Development](#development)
- [Sources](#sources)

## Install

You need Go 1.27 or newer. With an older Go, the `go` command downloads 1.27 by
itself.

```bash
cd helpers/testudo
make build          # bin/testudo, or bin/testudo.exe on Windows
make install        # installs testudo into GOBIN, so it runs from any folder
make build-all      # dist/ with binaries for Linux, macOS and Windows (amd64 and arm64)
```

Or run it straight from the source:

```bash
go run . find persons --count 3 --env at23
```

On Windows, run make from Git Bash. Install make with
`winget install ezwinports.make` if you do not have it. `make help` lists all
targets.

Flags always take two dashes, for example `--count 5` and `--help`. testudo has
no single-letter shorthands.

## Configuration

testudo reads keys and addresses from `~/.testudo.yaml`, or from the file you
give with `--config`. Do not commit the file.

```yaml
MASKINPORTEN_CLIENT_ID: '...'
MASKINPORTEN_JWK: '{"kty":"RSA",...}'   # private key for the Maskinporten client that reads Tenor
TOKEN_GENERATOR_USERNAME: '...'         # test token generator, as in K6 and Playwright
TOKEN_GENERATOR_PASSWORD: '...'

at23:                                   # one section per environment: at22, at23, tt02, yt01
  API_BASE_URL: 'https://platform.at23.altinn.cloud'
  REGISTER_SUBSCRIPTION_KEY: '...'
```

| Key | Used for |
| --- | --- |
| `MASKINPORTEN_CLIENT_ID`, `MASKINPORTEN_JWK` | Token for Tenor, with the scope `skatteetaten:testnorge/testdata.read`. |
| `TOKEN_GENERATOR_USERNAME`, `TOKEN_GENERATOR_PASSWORD` | Platform access token for Register, from the test token generator. |
| `API_BASE_URL` | Register for the environment. |
| `REGISTER_SUBSCRIPTION_KEY` | APIM subscription key for Register. `<ENV>_REGISTER_SUBSCRIPTION_KEY` (for example `AT23_REGISTER_SUBSCRIPTION_KEY`) works too. |
| `ENV_NAME` | Optional. If it is set, it must match `--env`, so a value meant for one environment is not used for another. |

A value is taken from the environment variable with the same name first, then
from the section for `--env`, then from the top of the file. The same file can
therefore be used in CI, where the values come from secrets as environment
variables.

## How it picks parties

1. testudo searches Tenor with a KQL query built from your flags. Tenor returns
   random hits, so every run gives other persons and organizations.
2. It looks the hits up in Register for `--env`, 100 at a time, together with
   the person and the hovedenhet of each organization.
3. Hits that do not exist in Register, or whose person or hovedenhet does not,
   are replaced with new hits from Tenor, for up to five rounds.
4. It prints the result. Logs and warnings go to stderr and the data goes to
   stdout, so the output can be piped or written with `--out`.

If it cannot find as many as you asked for, it says so with a warning and
prints the ones it found.

`--env` defaults to `tt02`. Always set it when you make test data, since
the identifiers differ between environments.

## find persons

Finds persons with personstatus bosatt who are 18 or older.

```bash
testudo find persons --count 3 --env at23 --name
```
```
Fetching 3 person(s) from Tenor with KQL: (personstatus:"bosatt") AND (foedselsdato:[* to 2008-11-05])
20850699713	SKYFRI KASJOTT
17926799320	SKAPENDE SVOGER
16810599867	LETT ESPRESSOMASKIN
```

| Flag | Default | Description |
| --- | --- | --- |
| `--count` | `1` | Number of persons. |
| `--env` | `tt02` | Environment: `at22`, `at23`, `tt02` or `yt01`. |
| `--kql` | bosatt, 18 or older | Your own Tenor KQL for Folkeregisteret, for example `personstatus:"bosatt" AND sivilstand:"gift"`. |
| `--name` | | Prints the name next to the fødselsnummer in text output. |
| `--format`, `--columns`, `--out`, `--json` | | See [Output](#output). |

**CSV columns:**

| Column | Description |
| --- | --- |
| `personIdentifier` | Fødselsnummer. |
| `userId` | Altinn user id. With this column, persons without a user are left out. |
| `partyId` | Party id. |
| `partyUuid` | Party uuid. |
| `displayName`, `firstName`, `lastName` | Name, as Register has it. |

The default is `personIdentifier,userId,partyId,partyUuid`.

## find organizations

Finds organizations together with a person in the organization. By default the
person is the leader: the daglig leder, the innehaver of an `ENK`, or the
styreleder of a `BRL` or `ESEK` that has no daglig leder.

```bash
testudo find organizations --count 3 --env at23
```
```
Fetching 3 organizations with the leader from Tenor with KQL: organisasjonsform.kode:"AS"
314082710	OPPRETTHOLDENDE OPPBLÅST TIGER AS	22824297901
314112652	USENSUELL OMKOMMEN TIGER AS	26909799529
314149203	OPPKLARENDE STERK TIGER AS	02888197306
-> 3 organizations
```

| Flag | Default | Description |
| --- | --- | --- |
| `--count` | `10` | Number of organizations. |
| `--env` | `tt02` | Environment: `at22`, `at23`, `tt02` or `yt01`. |
| `--unit-type` | `AS` | Comma-separated organisasjonsformer: `AS`, `ENK`, `ESEK`, `BRL`, `NUF`. |
| `--person-role` | the leader | The person has this role in Enhetsregisteret instead, for example `styreleder`, `styremedlem`, `kontaktperson` or `prokurist`. `--help` lists all 21. |
| `--role` | | Finds tilretteleggere instead: organizations that are `revisor`, `regnskapsfoerer` or `forretningsfoerer` for at least one client. |
| `--subunits` | | Finds underenheter (`BEDR` and `AAFY`) instead, one per hovedenhet. The person is the hovedenhet's, since underenheter have no persons of their own. |
| `--min-subunits` | | Only organizations with at least this many underenheter. With `--subunits`, it applies to the hovedenheter. |
| `--orgno` | | Comma-separated organization numbers to fetch instead of searching. |
| `--format`, `--columns`, `--out`, `--json` | | See [Output](#output). |

`--unit-type`, `--orgno` and `--role` cannot be combined. `--subunits` and
`--min-subunits` do not work with `--orgno` or `--role`, and `--count` does not
work with `--orgno`.

**CSV columns:**

| Column | Description |
| --- | --- |
| `organizationIdentifier` | Organization number. |
| `displayName` | Name. |
| `partyId`, `partyUuid` | The organization's party id and party uuid. |
| `unitType` | Organisasjonsform, for example `AS` or `BEDR`. |
| `type` | The tilrettelegger role with `--role`, for example `regnskapsfoerer`. |
| `personRole` | The person's role, for example `daglig-leder`, `innehaver` or `styreleder`. |
| `ssn` | The person's fødselsnummer. |
| `userId`, `userPartyId`, `userPartyUuid` | The person's user id, party id and party uuid. |
| `lastName` | The person's last name. |
| `hovedenhetOrganizationIdentifier`, `hovedenhetDisplayName`, `hovedenhetPartyId`, `hovedenhetPartyUuid`, `hovedenhetUnitType` | The hovedenhet of an underenhet. Empty for other organizations. |

The default is `organizationIdentifier,displayName,partyId,partyUuid`.

## Output

| Flag | Description |
| --- | --- |
| `--format text` | Default. One line per party, tab-separated: the fødselsnummer (and name with `--name`) for persons, and organization number, name and the person's fødselsnummer for organizations. |
| `--format csv` | A header row and one row per party. Choose and order the columns with `--columns`. |
| `--format json`, `--json` | Everything: the party from Register, and the kildedata from Tenor. Useful for finding out what a party looks like, not for test data. |
| `--columns a,b,c` | The CSV columns, in that order. Only with `--format csv`. |
| `--out <file>` | Writes to the file instead of stdout. The file is only written when everything went well. Missing folders are created. |

A CSV row is left out when one of its columns has no value, for example a
person without a user, or a `hovedenhet…` column for an organization that is
not an underenhet. testudo says how many rows it skipped. Ask for a few more
rows than you need if the count matters.

## Recipes for K6 setup

Run these from `helpers/testudo`, with testudo installed by `make install`, or
with `go run .` in place of `testudo`. Swap `--env` and the file name for each
environment.

**Persons who can log in.** A personal token from the token generator needs
the fødselsnummer, user id and party uuid:

```bash
testudo find persons --count 20 --env at23 --format csv \
  --columns personIdentifier,userId,partyId,partyUuid \
  --out ../../K6/testdata/my-area/persons/at23.csv
```

**An organization and its daglig leder.** For tests where a person acts on
behalf of an organization:

```bash
testudo find organizations --count 20 --env at23 --format csv \
  --columns organizationIdentifier,partyUuid,ssn,userId,userPartyUuid
```
```
organizationIdentifier,partyUuid,ssn,userId,userPartyUuid
312495333,aed79ea7-6c4c-4d78-96b4-99a9f467d684,02925098526,21057293,e7128b95-ef21-43bb-ac67-5db998d8ba3a
310428558,fa9dace2-cf15-4cc3-86fe-e7acc9727607,15828299376,20139712,1a9958e8-0410-448b-a3dd-3b4f47d18e87
```

**Other organisasjonsformer.** An `ENK` with its innehaver, or a mix:

```bash
testudo find organizations --count 10 --env at23 --unit-type ENK --format csv \
  --columns organizationIdentifier,unitType,personRole,ssn,userId
testudo find organizations --count 10 --env at23 --unit-type AS,ENK,NUF --format csv \
  --columns organizationIdentifier,unitType,ssn
```

**A person with a given ER role.** For example the styreleder, for tests of
roles other than daglig leder:

```bash
testudo find organizations --count 10 --env at23 --person-role styreleder --format csv \
  --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyUuid
```

**Tilretteleggere.** Organizations that are regnskapsfører (or revisor, or
forretningsfører) for at least one client, with their daglig leder:

```bash
testudo find organizations --count 10 --env at23 --role regnskapsfoerer --format csv \
  --columns organizationIdentifier,partyUuid,type,ssn,userId,userPartyUuid
```

**Underenheter with their hovedenhet.** For tests of access that is inherited
from the hovedenhet:

```bash
testudo find organizations --count 10 --env at23 --subunits --format csv \
  --columns organizationIdentifier,partyUuid,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,ssn,userId
```
```
organizationIdentifier,partyUuid,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,ssn,userId
315643686,fd22c551-dd23-4981-92f3-932a2fa90512,313964647,23834704-1cda-466b-8225-8724512690dc,03834198176,20588323
```

**Organizations with many underenheter.** For example to test lists or paging:

```bash
testudo find organizations --count 10 --env at23 --min-subunits 3 --format csv \
  --columns organizationIdentifier,partyUuid,ssn
```

**Known organizations.** When a test needs a given organization, or to check
that the ones in a file still exist and have the same ids:

```bash
testudo find organizations --orgno 313490114,312495333 --env at23 --format csv \
  --columns organizationIdentifier,partyId,partyUuid,ssn
```

**Persons with something special.** Write your own KQL for Folkeregisteret.
The field names are the ones Tenor uses:

```bash
testudo find persons --count 10 --env at23 --kql 'personstatus:"bosatt" AND sivilstand:"gift"' \
  --format csv --columns personIdentifier,userId,partyUuid
```

**One file per environment:**

```bash
for env in at22 at23 tt02 yt01; do
  testudo find organizations --count 20 --env $env --format csv \
    --columns organizationIdentifier,partyUuid,ssn,userId,userPartyUuid \
    --out ../../K6/testdata/my-area/organizations/$env.csv
done
```

### Reading the file in K6

Give new files testudo's column names, so they can be made again without
renaming anything. Then read them in `setup()`:

```js
import { fetchTestData, getItemFromList } from "../../../helpers.js";

export function setup() {
    return fetchTestData(`my-area/organizations/${__ENV.ENVIRONMENT}.csv`);
}

export default function (rows) {
    const row = getItemFromList(rows);
    // row.organizationIdentifier, row.partyUuid, row.ssn, row.userId, row.userPartyUuid
}
```

`fetchTestData()` reads from `main` on GitHub. To try a new file before it is
merged, serve `K6/testdata` locally:

```bash
npm run serve                                    # from the repo root
USE_LOCAL_TEST_DATA=true k6 run K6/api/tests/my-area/my-test.js
```

Existing files often use other column names, such as `orgNo` or `pid`. The
[`generate` helper](../../K6/testdata/README.md#setup) in the test data README
runs testudo and replaces the header row with the names the file uses.

> [!WARNING]
> A file made again gets other identities than before. Check what else reads
> the file, and read
> [Before you replace a file](../../K6/testdata/README.md#before-you-replace-a-file).

## What testudo does not do

testudo only finds parties that already exist. It does not create
delegations, access packages, consents, system users or resources in the
Resource Registry. Test data that needs those is listed in
[Cannot be made with testudo](../../K6/testdata/README.md#cannot-be-made-with-testudo),
and is still made by K6 scripts.

## Development

```bash
make check    # gofmt, go vet and the tests
make fmt      # formats the code
```

| Folder | Contents |
| --- | --- |
| `cmd/` | The commands, their flags and the output (text, JSON, CSV). |
| `internal/parties/` | Finding persons and organizations: the Tenor queries and the Register lookup. |
| `internal/tenor/` | Tenor client and KQL helpers. `tenortest/` has fakes for tests. |
| `internal/register/` | Register client. `registertest/` has fakes for tests. |
| `internal/maskinporten/`, `internal/platformtoken/` | Tokens for Tenor and Register. |
| `internal/config/` | Reads `~/.testudo.yaml` and environment variables. |

The code is in English. Words from the domain that have no good English
equivalent stay in Norwegian, for example hovedenhet, underenhet, daglig leder
and tilrettelegger, as do field names from Tenor and Enhetsregisteret.

## Sources

What testudo is built on, and where to look when something changes.

**Tenor (Skatteetaten)**

- [Tenor documentation](https://skatteetaten.github.io/testnorge-tenor-dokumentasjon/)
  and the [technical API description](https://skatteetaten.github.io/testnorge-tenor-dokumentasjon/api/teknisk/):
  the search API (`/api/testnorge/v2/soek/{freg|brreg-er-fr}`), paging with
  `seed`, and the `kildedata` in each hit.
- [Advanced search in Folkeregisteret (PDF)](https://skatteetaten.github.io/testnorge-tenor-dokumentasjon/assets/files/avansert_s%C3%B8k_freg-8ab07e93b9bd366722bd03b46a0d489b.pdf):
  the field names you can use in `--kql`.
- [Kibana Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html):
  the syntax Tenor's KQL is based on.
- [Tenor in the browser](https://testdata.skatteetaten.no): handy for trying a
  query before you put it in `--kql`.

**Maskinporten (Digdir)**

- [JWT grant](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_jwtgrant):
  how testudo gets the token for Tenor, with the scope
  `skatteetaten:testnorge/testdata.read`.

**Enhetsregisteret (Brønnøysundregistrene)**

- [API documentation](https://data.brreg.no/enhetsregisteret/api/dokumentasjon/no/index.html):
  role groups and roles in `kildedata`.
- [Role types](https://data.brreg.no/enhetsregisteret/api/roller/rolletyper):
  the codes behind `--person-role` and the leader (`DAGL`, `INNH`, `LEDE` and
  so on).
- [Organisasjonsformer](https://data.brreg.no/enhetsregisteret/api/organisasjonsformer):
  the codes behind `--unit-type`, and `BEDR` and `AAFY` for underenheter.

**Altinn**

- [altinn-register](https://github.com/Altinn/altinn-register): the parties
  query testudo uses (`/register/api/v1/access-management/parties/query`), and
  how Register imports Enhetsregisteret, for example
  [CcrImportJob.cs](https://github.com/Altinn/altinn-register/blob/main/src/apps/Altinn.Register/src/Altinn.Register/PartyImport/Ccr/CcrImportJob.cs).
  The link from an underenhet to its hovedenhet is the external role
  `hovedenhet` (or `ikke-naeringsdrivende-hovedenhet`).
- [RoleSyncService.cs](https://github.com/Altinn/altinn-auth/blob/main/src/apps/Altinn.AccessManagement/src/Altinn.AccessMgmt.Core/HostedServices/Services/RoleSyncService.cs)
  in altinn-auth: how Access Management syncs the roles from Register, and
  turns the hovedenhet role into the parent of an underenhet.
- [Test token generator](https://github.com/Altinn/AltinnTestTools/tree/master/TokenGenerator):
  the platform access token for Register. K6 uses the same service, see
  [K6/token-generator.js](../../K6/token-generator.js).
- [altinn-platform-validation-tests#323](https://github.com/Altinn/altinn-platform-validation-tests/issues/323):
  the column names testudo uses in CSV.
- [beOmTilgang.ts](https://github.com/Altinn/altinn-access-management-frontend/blob/main/playwright/tenor/commands/beOmTilgang.ts)
  in altinn-access-management-frontend: how the Playwright tests used Tenor
  before testudo.

**Go libraries**

- [cobra](https://github.com/spf13/cobra) for the commands and flags,
  [viper](https://github.com/spf13/viper) for the config file, and
  [jwx](https://github.com/lestrrat-go/jwx) for the Maskinporten JWT.
