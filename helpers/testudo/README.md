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

testudo also makes the Kubernetes manifests that run the K6 tests in the k6
cluster, see [k6 generate](#k6-generate).

- [Install](#install)
- [Configuration](#configuration)
- [How it picks parties](#how-it-picks-parties)
- [find persons](#find-persons)
- [find organizations](#find-organizations)
- [Output](#output)
- [API](#api)
- [notify playwright](#notify-playwright)
- [Recipes for K6 setup](#recipes-for-k6-setup)
- [k6 generate](#k6-generate)
- [version](#version)
- [What testudo does not do](#what-testudo-does-not-do)
- [Development](#development)
- [Sources](#sources)

## Install

### Download

Every change to testudo on `main` is built for Linux, macOS and Windows (amd64
and arm64) and published as the
[testudo-latest](https://github.com/Altinn/altinn-platform-validation-tests/releases/tag/testudo-latest)
release. It has no version number: the release notes name the commit it was
built from, and the next change replaces the files. `testudo version` shows the
commit of the binary you have.

```bash
gh release download testudo-latest --repo Altinn/altinn-platform-validation-tests \
  --pattern testudo-linux-amd64 --pattern checksums.txt
sha256sum --check --ignore-missing checksums.txt
chmod +x testudo-linux-amd64
```

On macOS, check with `shasum -a 256 --check --ignore-missing checksums.txt`.
The files are named `testudo-<os>-<arch>`, for example `testudo-darwin-arm64`
for a Mac with Apple silicon and `testudo-windows-amd64.exe`. Without `gh`,
download them from
`https://github.com/Altinn/altinn-platform-validation-tests/releases/download/testudo-latest/<file>`.

The macOS binaries are not signed. A file downloaded with a browser is
quarantined, and macOS refuses to run it; remove the quarantine with
`xattr -d com.apple.quarantine testudo-darwin-arm64`.

### Build

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

`--env` defaults to `at23`. Always set it when you make test data, since
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
| `--count` | `1` | Number of persons, at most 1000. |
| `--env` | `at23` | Environment: `at22`, `at23`, `tt02` or `yt01`. |
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
person is the leader: the daglig leder, the innehaver of an `ENK`, the
styreleder of a `BRL` or `ESEK` that has no daglig leder, the bostyrer of a
`KBO` (konkursbo), or the bestyrende reder of a `PRE` (partsrederi). Some unit
types have no leader, for example `VPFO` (verdipapirfond); use
`--person-role kontaktperson` for them.

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
| `--count` | `10` | Number of organizations, at most 1000. |
| `--env` | `at23` | Environment: `at22`, `at23`, `tt02` or `yt01`. |
| `--unit-type` | `AS` | Comma-separated organisasjonsformer, for example `AS`, `ENK`, `ESEK`, `BRL`, `NUF`, `KBO` or `PRE`. Any hovedenhet Access Management has roles from Enhetsregisteret for, and `ADOS`, whose units come with their hovedenhet, see [ADOS units](#ados-units). `--help` lists all 46. |
| `--person-role` | the leader | The person has this role in Enhetsregisteret instead, for example `styreleder`, `styremedlem`, `kontaktperson`, `prokurist` or `bestyrende-reder`. `--help` lists all 22: the roles Access Management has given persons that persons also have in Tenor. |
| `--role` | | Finds tilretteleggere instead: organizations that are `revisor`, `regnskapsfoerer` or `forretningsfoerer` for at least one client. The `client…` columns describe the client it was found through. |
| `--subunits` | | Finds underenheter (`BEDR` and `AAFY`) instead, one per hovedenhet. The person is the hovedenhet's, since underenheter have no persons of their own. |
| `--min-subunits` | | Only organizations with at least this many underenheter. With `--subunits`, it applies to the hovedenheter. |
| `--orgno` | | Comma-separated organization numbers to fetch instead of searching. |
| `--format`, `--columns`, `--out`, `--json` | | See [Output](#output). |

`--unit-type`, `--orgno` and `--role` cannot be combined. `--subunits` and
`--min-subunits` do not work with `--orgno` or `--role`, and `--count` does not
work with `--orgno`. `--subunits` does not work with `--unit-type ADOS`.

### ADOS units

An `ADOS` (administrativ enhet - offentlig sektor) unit has no persons of its
own. In Enhetsregisteret it has the role `ADOS`, which points to the
organization it belongs to, often a `KOMM`. Register calls that role
`administrativ-enhet-offentlig-sektor`, and Access Management makes the
organization its parent, as for `BEDR` and `AAFY`, when the feature flag
`AccessManagement.Subunit.AdosInheritance` is on. testudo therefore treats an
`ADOS` unit as an underenhet: the person and the `hovedenhet…` columns are from
the organization in the `ADOS` role. This also applies to `--orgno`.

**CSV columns:**

| Column | Description |
| --- | --- |
| `organizationIdentifier` | Organization number. |
| `displayName` | Name. |
| `partyId`, `partyUuid` | The organization's party id and party uuid. |
| `unitType` | Organisasjonsform, for example `AS` or `BEDR`. |
| `type` | The tilrettelegger role with `--role`, for example `regnskapsfoerer`. |
| `personRole` | The person's role, for example `daglig-leder`, `innehaver`, `styreleder` or `bostyrer`. |
| `ssn` | The person's fødselsnummer. |
| `userId`, `userPartyId`, `userPartyUuid` | The person's user id, party id and party uuid. |
| `lastName` | The person's last name. |
| `hovedenhetOrganizationIdentifier`, `hovedenhetDisplayName`, `hovedenhetPartyId`, `hovedenhetPartyUuid`, `hovedenhetUnitType` | The hovedenhet of an underenhet. Empty for other organizations. |
| `clientOrganizationIdentifier`, `clientDisplayName`, `clientPartyId`, `clientPartyUuid`, `clientUnitType` | With `--role`, the client the tilrettelegger was found through: an organization that has it as `revisor`, `regnskapsfoerer` or `forretningsfoerer`. It exists in Register too. Empty without `--role`. |
| `clientPersonRole`, `clientSsn`, `clientUserId`, `clientUserPartyId`, `clientUserPartyUuid` | With `--role`, the client's leader, as for `personRole`, `ssn` and the rest. testudo prefers a client with a leader, but a row that asks for these columns is left out when the client has none. |

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

## API

`testudo serve` makes the find commands available over HTTP. Each command is
an endpoint, and its flags are query parameters with the same names:

| Endpoint | Same as | Query parameters |
| --- | --- | --- |
| `GET /find/persons` | `testudo find persons` | `count`, `kql`, `name`, `json`, `env`, `format`, `columns` |
| `GET /find/organizations` | `testudo find organizations` | `count`, `unit-type`, `min-subunits`, `subunits`, `orgno`, `role`, `person-role`, `json`, `env`, `format`, `columns` |

```bash
testudo serve                  # listens on localhost:8080
testudo serve --addr :8080     # listens on all network interfaces
```

```bash
curl "localhost:8080/find/persons?env=at23&count=3"
curl "localhost:8080/find/persons?env=at23&count=20&columns=personIdentifier,userId,partyUuid"
curl "localhost:8080/find/organizations?env=at23&count=10&unit-type=ENK&columns=organizationIdentifier,ssn,userId"
curl "localhost:8080/find/organizations?env=at23&count=5&subunits&columns=organizationIdentifier,hovedenhetOrganizationIdentifier"
```

The parameters work as the flags do, with these differences:

- The response is **CSV by default**, with the command's default columns,
  while the command prints text by default. Use `format=json` (or `json`) or
  `format=text` for the others.
- Lists can be comma-separated or repeated: `unit-type=AS,ENK` and
  `unit-type=AS&unit-type=ENK` are the same.
- A boolean without a value is true, as a flag is: `?subunits` is
  `?subunits=true`.
- `out` is not available. An unknown parameter is an error, so a misspelled
  one is not silently ignored.

| Status | When |
| --- | --- |
| `200` | The result, as `text/csv`, `application/json` or `text/plain`. |
| `400` | Invalid parameters, or an environment that is not configured. |
| `404` | Nothing that exists in Register was found. |
| `502` | Tenor or Register failed. |

Errors are JSON, for example
`{"error": "Invalid data: unknown query parameter \"n\", use one of ..."}`.
Messages about the flags name them as flags, for example `--unit-type`; the
parameter has the same name without the dashes.

The server uses the configuration in [Configuration](#configuration), and logs
each request and what it fetched to stderr. Stop it with Ctrl+C.

> [!NOTE]
> The server answers anyone who can reach it, with your keys. Keep the default
> `localhost` unless the network around it is closed.

## notify playwright

Sends the result of a Playwright run to Slack.

```bash
testudo notify playwright --env at23 --report test-results.json \
  --report-url https://... --playwright-exit 1 --dry-run
```
```
:red_circle: *at23*: 2 of 14 Playwright tests failed
• logs in
• switches language
Report: https://...
```

A test is counted once however many browsers it ran in, and is failed if it
failed in at least one. The message names the first five failed tests, and only
their titles, since error messages can contain test data from prod. If the
report is missing or no tests ran, the message says that the run did not start.

| Flag | Default | Description |
| --- | --- | --- |
| `--env` | | Environment the tests ran against. `prod` is shown as Production. |
| `--report` | `test-results.json` | Path to the Playwright JSON report. |
| `--report-url` | | URL to the published HTML report. |
| `--playwright-exit` | `0` | Exit code from Playwright, shown when no tests ran. |
| `--dry-run` | | Prints the message instead of sending it. |

The message is sent to the webhook in `SLACK_WEBHOOK_URL`.

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

**A konkursbo and its bostyrer.** For tests of what the bostyrer can do on
behalf of the konkursbo:

```bash
testudo find organizations --count 10 --env at23 --unit-type KBO --format csv \
  --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid
```

**A partsrederi and its bestyrende reder.** For tests of what the bestyrende
reder can do on behalf of the partsrederi:

```bash
testudo find organizations --count 10 --env at23 --unit-type PRE --person-role bestyrende-reder --format csv \
  --columns organizationIdentifier,partyUuid,personRole,ssn,userId,userPartyId,userPartyUuid
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

Add the client and its leader, for tests where the daglig leder of the
tilrettelegger acts for one of its clients, or where the client gives the
tilrettelegger access first:

```bash
testudo find organizations --count 10 --env at23 --role regnskapsfoerer --format csv \
  --columns organizationIdentifier,partyUuid,ssn,userId,userPartyId,userPartyUuid,clientOrganizationIdentifier,clientPartyUuid,clientSsn,clientUserId,clientUserPartyId,clientUserPartyUuid
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

**ADOS units with their hovedenhet.** For tests of access that an `ADOS` unit
inherits from the organization it belongs to:

```bash
testudo find organizations --count 10 --env at22 --unit-type ADOS --format csv \n  --columns organizationIdentifier,partyUuid,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,hovedenhetUnitType,ssn,userId,userPartyId,userPartyUuid
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

## k6 generate

Makes the Kubernetes manifests that run the tests in a K6 config file
(`functional.yaml`, `smoke.yaml`, `healthcheck.yaml`, `breakpoint.yaml` or
`browser.yaml` under `K6/`) in the k6 cluster, for every environment in the file
where the test is enabled, and the CronJob that runs them on a schedule. The
code was moved here from
[actions/generate-k6-manifests](https://github.com/Altinn/altinn-platform/tree/main/actions/generate-k6-manifests)
in altinn-platform, and the manifests hold the same values, except that the `generated-by`
label on the ConfigMaps, TestRuns, runner pods and CronJobs is `testudo`. The
generator in altinn-platform wrote `k6-action-image`, and `github-action` on the
CronJobs. The ad-hoc workflows still use
the action from altinn-platform, and the CronJobs still run the generator in
the altinn-platform image. The CronJobs themselves are still made by
`hack/create_cronjobs.sh`, see [Schedules](#schedules).

Run it from the root of the repository, since the paths in the config files are
relative to it. `k6` must be on PATH, since it makes the k6 archives. testudo
makes the ConfigMaps and TestRuns itself, without kubectl or jsonnet, and sends
nothing to a cluster.

```bash
testudo k6 generate K6/api/tests/portaler/smoke.yaml
kubectl apply --server-side -f .dist/ -R
```

| Folder | Contents |
| --- | --- |
| `.dist/<test id>/` | `configmap.json` with the k6 archive, and `testrun.json` for the k6 operator. This is what you apply. |
| `.conf/` | `expanded-configfile.yaml`, the config file with all defaults filled in, and `<test id>/tweaked-testconfig.json`, the k6 options for each test. |
| `.build/<test id>/` | `archive.tar`, the k6 archive. |
| `.cronjobs/` | The CronJob for the config file, e.g. `K6_api_tests_portaler_smoke.json`. It is kept apart from `.dist/`, so applying the tests never changes a schedule. |

The four folders are emptied first, so manifests from an earlier run are not
applied by mistake.

The tests are made at the same time, as many at once as `--parallel` says. The
default is the number of CPUs testudo may use, which in a container is its CPU
limit. Each test runs `k6 archive`, so this is also how many k6 processes run at
once.

A test that fails does not stop the others. testudo lists every test that
failed, in the order of the config file and with its test id, and exits with a
non-zero code. A test that fails leaves nothing in `.dist/`, so applying `.dist/`
after a failed run only applies the tests that were made in full. testudo
checks that k6 is on PATH before it reads the config file or empties the
folders, so a missing k6 is one error and changes nothing.

Every test in a run gets the time the command started, in
`MANIFEST_GENERATION_TIMESTAMP` and the `generation_timestamp` label. The
TestRun name and its `uniq_name` label are
`<environment>-<timestamp>-<five characters>`, where the five characters are
made from the test id and the timestamp, so each test in a run gets its own
name.

A test runs in an environment unless its context says `enabled: false` under
`test_type:`. Leaving out `enabled:` means enabled, also when `test_type:` is
there. The generator in the altinn-platform image, which the CronJobs and the
ad-hoc workflows still use, skips a `test_type:` without `enabled:`, so write
`enabled: true` until they use testudo.

### Schedules

The CronJob runs the tests in the config file on the schedule in `schedule:`, a
cron expression at the top of the file:

```yaml
namespace: portaler
schedule: "30 6 * * 1-5" # 06:30 on weekdays
base_dir: K6/api/tests/portaler/
test_definitions:
  ...
```

Without `schedule:`, functional, healthcheck and browser tests run every 15
minutes (`*/15 * * * *`), and smoke tests every hour (`0 * * * *`). Breakpoint
tests only get a CronJob when their file has a `schedule:`.

testudo's CronJobs are not applied yet. The
[Generate and Apply K6 CronJobs](../../.github/workflows/apply-cronjobs.yaml)
workflow still makes them with `hack/create_cronjobs.sh` and
`hack/cronjob.jsonnet`: functional, healthcheck and browser tests every 10 to 20
minutes, smoke tests once an hour at a random minute, and no breakpoint tests.
It does not read `schedule:`, so `schedule:` has no effect in the cluster until
the workflow uses testudo.

`--cronjobs-only` makes only the CronJobs, which do not need k6:

```bash
testudo k6 generate --cronjobs-only K6/api/tests/portaler/smoke.yaml K6/api/tests/portaler/functional.yaml
```

The CronJob names and files are made from the path of the config file, the
same way `hack/cronjob.jsonnet` makes them, so applying testudo's CronJobs will
replace the ones in the cluster. A name longer than 52 characters loses its
vowels.

Arguments after `--` are given to k6 in the TestRun. Each `-e` or
`--env KEY=VALUE` among them is also set as an environment variable for the
test, which is how an ad-hoc breakpoint run sets the load:

```bash
testudo k6 generate K6/api/tests/access-management/consent/breakpoint.yaml -- --env BREAKPOINT_STAGE_TARGET=50 --env BREAKPOINT_STAGE_DURATION=5m
```

`--slack` picks the Slack secret the tests get, and so the channel they post
failed checks to. `test`, the default, gives `slack-test`, so a run from a
branch or a laptop does not post to the team channels. `environment` gives
`slack-dev` for at22, at23 and yt01, and `slack-prod` for tt02 and prod:

```bash
testudo k6 generate --slack environment K6/api/tests/portaler/smoke.yaml
```

A key the config file format does not have, for example a typo such as
`enviroment:`, is an error, so it is not silently ignored.

## version

Shows which build of testudo you have: the commit it was built from, when that
commit was made, and the Go version and platform it was built for.

```bash
testudo version
testudo version --json
```

```text
commit:      19963b6680dbcbb1328e5a459a827fcf1590384d
commit time: 2026-11-26T11:37:50Z
go:          go1.27.2
platform:    linux/amd64
```

Go records the commit when testudo is built in a git checkout, as
[make build](#build) and the [testudo-latest](#download) release are. If the
checkout had changes that were not committed, the commit line says so. `go run`
records no commit, so it is `unknown`. A testudo installed with
`go install …@<version>` has a `version:` line instead of a commit. The config
file is not read, so `version` works even when the config file is broken.

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
| `cmd/` | The commands, their flags and the output (text, JSON, CSV). `serve.go` has the API. |
| `internal/parties/` | Finding persons and organizations: the Tenor queries and the Register lookup. |
| `internal/tenor/` | Tenor client and KQL helpers. `tenortest/` has fakes for tests. |
| `internal/register/` | Register client. `registertest/` has fakes for tests. |
| `internal/maskinporten/`, `internal/platformtoken/` | Tokens for Tenor and Register. |
| `internal/config/` | Reads `~/.testudo.yaml` and environment variables. |
| `internal/playwright/`, `internal/slack/` | Reading the Playwright report and sending to Slack, for `notify playwright`. |
| `internal/k6manifest/` | Reads the K6 config files and makes the manifests for `k6 generate`. `testrun.go` makes the TestRun. `assets/` has the default load profile for each test type and the k6 cluster config. `testdata/` has example config files and the expected output, made at a fixed time (1700000000000 in Unix milliseconds) so the timestamps and TestRun names in it are as they are. The expected TestRun and CronJob files were made with jsonnet, so the tests compare them as JSON values, not as text. |
| `internal/tools/` | Checks that the programs a command runs, such as k6, are on PATH. A command calls `tools.Require` before it starts. |
| `internal/buildinfo/` | The commit, commit time and Go version Go recorded in the binary, for `version`. |

`TestGenerate` in `internal/k6manifest/` runs k6, and fails when it is not on
PATH. Install k6 before you run the tests.

The [Test and release testudo](../../.github/workflows/release-testudo.yaml)
workflow runs `make check` on pull requests that change testudo. On `main` it
also runs `make build-all` and publishes the binaries as the
[testudo-latest](#download) release.

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
  the codes behind `--person-role` and the leader (`DAGL`, `INNH`, `LEDE`,
  `BOBE` and so on).
- [Organisasjonsformer](https://data.brreg.no/enhetsregisteret/api/organisasjonsformer):
  the codes behind `--unit-type`, and `BEDR`, `AAFY` and `ADOS` for underenheter.

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

**K6**

- [k6 archive](https://grafana.com/docs/k6/latest/reference/archive/): what
  `k6 generate` puts in the ConfigMap, and why `--env` values are baked into
  it.
- [k6-operator](https://github.com/grafana/k6-operator): the `TestRun`
  resource that runs the archive in the cluster.

**Go libraries**

- [cobra](https://github.com/spf13/cobra) for the commands and flags,
  [viper](https://github.com/spf13/viper) for the config file, and
  [jwx](https://github.com/lestrrat-go/jwx) for the Maskinporten JWT.
- [yaml.v3](https://github.com/go-yaml/yaml) for the K6 config files, and
  [k8s.io/api](https://github.com/kubernetes/api) for the ConfigMap.
