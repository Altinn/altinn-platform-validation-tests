# Test data

This document shows how to make the CSV files here again with
[testudo](../../helpers/testudo). Only the files that testudo can make on its
own are included. Files that need delegations, consents, system users or other
things that must already exist in the environment are listed
[at the bottom](#cannot-be-made-with-testudo).

> [!WARNING]
> Testudo picks new, random persons and organizations from Tenor every time.
> A file that is made again gets other identities than today, and the same
> identities no longer appear across the environments. Read
> [Before you replace a file](#before-you-replace-a-file) first, and run the
> tests that read the file before you commit.

## Setup

Run everything from `helpers/testudo`, with Git Bash or another bash.

Testudo reads keys and addresses from `~/.testudo.yaml` (or the file you give
with `--config`). Environment variables with the same name take precedence. Do
not commit the file:

```yaml
MASKINPORTEN_CLIENT_ID: '...'
MASKINPORTEN_JWK: '{"kty":"RSA",...}'   # private key for Tenor
TOKEN_GENERATOR_USERNAME: '...'         # test token generator, as in K6 and Playwright
TOKEN_GENERATOR_PASSWORD: '...'

at23:                                   # one section per environment: at22, at23, tt02, yt01
  API_BASE_URL: 'https://platform.at23.altinn.cloud'
  REGISTER_SUBSCRIPTION_KEY: '...'
```

```bash
cd helpers/testudo
T=../../K6/testdata
ENV=at23   # at22, at23, tt02 or yt01

# generate <file> <column names in the file> <testudo arguments>
# Runs testudo, replaces the first line with the column names the file uses,
# and overwrites the file only when everything went well.
generate() {
  local file=$1 header=$2
  shift 2
  go run . find "$@" --format csv --out new.csv &&
    { echo "$header"; tail -n +2 new.csv; } > "$file" && rm new.csv
}
```

Testudo uses the field names from Register (`personIdentifier`, `partyUuid` and
so on), while the files here use other names. The recipes therefore ask for the
columns in the same order as the file, and `generate` replaces the first line.

Testudo always looks up the parties in Register for the environment in `--env`.
Rows where a party does not exist, or lacks a value (for example a person
without a user), are skipped. The recipes for yt01 files that use IDs from
Register (for example `request/yt01.csv` and the v2 files) are not included
yet. Some of them have other columns than in the other environments.

Testudo writes LF line endings, as `.gitattributes` asks for. Several of the
files here have CRLF today, so the diff shows every line as changed.

## Before you replace a file

- **New identities.** Today the files have the same persons and organizations
  in all environments. After a new generation this is no longer true.
- **Known dependencies:**
  - `authentication/change-request-system-user/end-users-<env>.csv` must have
    the row for 313490114, which has a pre-created system user with 120
    change requests (see `PAGINATION_SYSTEM_ID` in
    `api/tests/authentication/change-request-system-user/commons.js`).
    The recipe includes it.
  - The forretningsførere in `authentication/system-user-client-delegation`
    must have property clients. Testudo cannot check that, so the recipe keeps
    them.
- **Not checked:** whether the tests in `access-management-bff/export` expect
  the parties to already have delegations. The tests that make their own
  delegations (access-packages, single-rights, instance-delegation) do not
  need it.
- **Last names.** Register gives last names in upper case. Some files have
  lower case today.

## Persons

| Files | Rows today |
| --- | --- |
| `portaler/{at23,tt02}/userids.csv` | 10 |
| `access-management/consent/consenter-persons/{at22,at23,tt02}.csv` | 1000 |
| `access-management/enduser/client-delegations-v2/agents/{at22,at23,tt02}.csv` | 20 |

```bash
# The columns are the same as testudo uses, so `generate` is not needed here.
go run . find persons -n 10 --env $ENV --format csv --columns userId \
  --out $T/portaler/$ENV/userids.csv

generate $T/access-management/consent/consenter-persons/$ENV.csv ssn,partyUuid,userId,partyId \
  persons -n 1000 --env $ENV --columns personIdentifier,partyUuid,userId,partyId

generate $T/access-management/enduser/client-delegations-v2/agents/$ENV.csv pid,partyUuid,partyId,userId,lastName,name \
  persons -n 20 --env $ENV --columns personIdentifier,partyUuid,partyId,userId,lastName,displayName
```

## Organizations with a daglig leder

AS companies with a daglig leder, which is the default in `find organizations`.
The columns `ssn`, `userId`, `userPartyId`, `userPartyUuid` and `lastName` in
testudo are the daglig leder. `partyId` and `partyUuid` are the organization.

Choose other organisasjonsformer with `--unit-type`: `ENK`, `ESEK`, `BRL` and
`NUF`, or several separated by commas. For `ENK` the person is the innehaver,
and for `ESEK` and `BRL`, which rarely have a daglig leder, the styreleder.

With `--person-role` the person in the columns has another role from
Enhetsregisteret, e.g. `styreleder`, `styremedlem`, `varamedlem`,
`kontaktperson` or `prokurist` (`--help` lists them all). The roles have the
names from Access Management, and the column `personRole` says which role the
person has. Get several roles in the same organization with `--orgno`:

```bash
go run . find organizations -n 5 --env $ENV --format csv \
  --columns organizationIdentifier --out orgs.csv &&
go run . find organizations --orgno $(tail -n +2 orgs.csv | paste -sd,) \
  --person-role styreleder --env $ENV --format csv --columns organizationIdentifier,personRole,ssn
```

Organizations without a styreleder in Register are left out of the second list.

With `--subunits` you get underenheter (`BEDR` and `AAFY`) of organizations
with the organisasjonsformer in `--unit-type` (default `AS`), instead of the
organizations themselves, one per hovedenhet. Underenheter have no persons of
their own, so the person is from the hovedenhet, with the same rules as above.
The columns `hovedenhetOrganizationIdentifier`, `hovedenhetDisplayName`,
`hovedenhetPartyId`, `hovedenhetPartyUuid` and `hovedenhetUnitType` are the
hovedenhet. The name follows Register, where the link is the role `hovedenhet`
from the underenhet to the hovedenhet, and Enhetsregisteret, where the
underenhet has the hovedenhet in `overordnetEnhet`. Access Management uses the
same role for `ParentId`. Without `--subunits` the columns are empty, so the
rows are skipped in CSV.

```bash
go run . find organizations --subunits -n 5 --env $ENV --format csv \
  --columns organizationIdentifier,partyUuid,hovedenhetOrganizationIdentifier,hovedenhetPartyUuid,ssn
```

Underenheter of `ESEK` and `BRL` organizations are `AAFY`, with the styreleder
as the person: `--subunits --unit-type esek,brl`.

`--min-subunits N` requires at least N underenheter: without `--subunits` you
get the hovedenheter themselves, and with `--subunits` underenheter of such
hovedenheter.

```bash
# AS companies with at least two underenheter.
go run . find organizations --min-subunits 2 -n 5 --env $ENV --format csv
```

### pid, partyUuid, orgUuid, orgNo, lastName, …

| Files | Rows today |
| --- | --- |
| `access-management/enduser/request/{at22,at23,tt02}.csv` | 197, 198, 985 |
| `access-management/enduser/activity-log/{at22,at23}.csv` | 10 |

```bash
generate $T/access-management/enduser/request/$ENV.csv pid,partyUuid,orgUuid,orgNo,lastName,userId,partyId \
  organizations -n 198 --env $ENV \
  --columns ssn,userPartyUuid,partyUuid,organizationIdentifier,lastName,userId,userPartyId

generate $T/access-management/enduser/activity-log/$ENV.csv pid,partyUuid,orgUuid,orgNo,lastName \
  organizations -n 10 --env $ENV \
  --columns ssn,userPartyUuid,partyUuid,organizationIdentifier,lastName
```

### ssn, partyUuid, userId, orgUuid, orgNo, lastName, …

| Files | Rows today |
| --- | --- |
| `access-management/enduser/connections/at23.csv` | 9 |
| `access-management/resource-owner/maskinporten-schema/{at23,tt02}.csv` | 9 |
| `access-management-bff/client-admin/open-client-admin/{at23,tt02}.csv` | 9 |
| `access-management-bff/consent/{at23,tt02}.csv` | 9 |

```bash
generate $T/access-management/enduser/connections/at23.csv ssn,partyUuid,userId,orgUuid,orgNo,lastName \
  organizations -n 9 --env at23 \
  --columns ssn,userPartyUuid,userId,partyUuid,organizationIdentifier,lastName

# The same for open-client-admin and access-management-bff/consent.
generate $T/access-management/resource-owner/maskinporten-schema/$ENV.csv \
  ssn,partyUuid,userId,orgUuid,orgNo,lastName,userPartyId,partyId \
  organizations -n 9 --env $ENV \
  --columns ssn,userPartyUuid,userId,partyUuid,organizationIdentifier,lastName,userPartyId,partyId
```

### orgNo, partyId, ssn, userId, userPartyId, orgUuid, partyUuid, lastName

Here `partyId` is the organization and `partyUuid` is the daglig leder.

| Files in `access-management-bff/` and `correspondence/` | Rows today |
| --- | --- |
| `access-packages/{org-to-org,user-to-user}/{at23,tt02}.csv` | 5–6 |
| `export/{at23,tt02}/*.csv` (six files per environment) | 5–6 |
| `instance-delegation/{at23,tt02}/{org-user,user-user}.csv` | 505 |
| `single-rights/{at23,tt02}/{org-org,user-user}.csv` | 5 |
| `correspondence/{at23,tt02}/fullmakt-user-user.csv` | 5 |

```bash
V2=orgNo,partyId,ssn,userId,userPartyId,orgUuid,partyUuid,lastName
V2_TESTUDO=organizationIdentifier,partyId,ssn,userId,userPartyId,partyUuid,userPartyUuid,lastName

generate $T/access-management-bff/access-packages/org-to-org/$ENV.csv $V2 \
  organizations -n 6 --env $ENV --columns $V2_TESTUDO
# The same for the other files in the table, with the row count from the table.
```

### ssn and orgno

These only use organization number and fødselsnummer, and have the same
columns in yt01.

| Files | Rows today |
| --- | --- |
| `authorization/pdp-authorize/orgs-dagl-{at22,tt02,yt01}.csv` | 9, 9, 9999 |
| `access-management/resource-owner/get-authorized-parties/{at22,tt02,yt01}.csv` | 9, 9, 9999 |
| `dialogporten/{endusers,graphql,serviceowner}/{at23,tt02,yt01}/endusers.csv` | 28, 97, 2798 |

```bash
generate $T/authorization/pdp-authorize/orgs-dagl-$ENV.csv orgno,ssn \
  organizations -n 9 --env $ENV --columns organizationIdentifier,ssn

generate $T/access-management/resource-owner/get-authorized-parties/$ENV.csv orgno,ssn \
  organizations -n 9 --env $ENV --columns organizationIdentifier,ssn

# Note the reverse order.
generate $T/dialogporten/endusers/$ENV/endusers.csv ssn,orgno \
  organizations -n 28 --env $ENV --columns ssn,organizationIdentifier
```

### pid

The persons only need to be someone that authorized-parties returns parties
for. The generator in K6 uses daglige ledere, so the recipe does too. Make the
files one at a time, so they do not have the same persons.

| Files in `access-management/resource-owner/authorized-parties/` | Rows today |
| --- | --- |
| `{authorization-boundaries,org-code-filter}/{at22,at23,tt02,yt01}.csv` | 10 |

```bash
generate $T/access-management/resource-owner/authorized-parties/authorization-boundaries/$ENV.csv pid \
  organizations -n 10 --env $ENV --columns ssn
generate $T/access-management/resource-owner/authorized-parties/org-code-filter/$ENV.csv pid \
  organizations -n 10 --env $ENV --columns ssn
```

### subject-lookup-forms

> [!CAUTION]
> The generator (`access-management/resource-owner/authorized-parties/subject-lookup-forms-data.js`) only
> keeps rows where authorized-parties returns a list that is not empty, both
> for the person and the organization. Testudo cannot check that, so the test
> may reject some rows.

The file uses the default names from testudo, so it does not need `generate`:

```bash
go run . find organizations -n 10 --env $ENV --format csv \
  --columns organizationIdentifier,partyUuid,ssn,userId,userPartyId,userPartyUuid \
  --out $T/access-management/resource-owner/authorized-parties/subject-lookup-forms/$ENV.csv
```

### change-request-system-user/end-users

The row for 313490114 must be included (see [above](#before-you-replace-a-file)),
and `role` is always `dagligleder`.

```bash
K=organizationIdentifier,partyId,partyUuid,unitType,userId,userPartyUuid,ssn
go run . find organizations --orgno 313490114 --env $ENV \
  --format csv --columns $K --out fixed.csv &&
go run . find organizations -n 199 --env $ENV --format csv --columns $K --out new.csv &&
{ echo orgNo,orgPartyId,orgPartyUuid,orgType,role,userId,userPartyUuid,userPid
  tail -n +2 fixed.csv; tail -n +2 new.csv; } |
  awk -F, -v OFS=, 'NR > 1 { $4 = $4 OFS "dagligleder" } 1' \
  > $T/authentication/change-request-system-user/end-users-$ENV.csv &&
rm fixed.csv new.csv
```

## Organizations without a person

```bash
# access-management/consent/consentee-orgs/{at22,at23,tt02,yt01}.csv, 20 rows
generate $T/access-management/consent/consentee-orgs/$ENV.csv orgNo \
  organizations -n 20 --env $ENV --columns organizationIdentifier

# authentication/change-request-system-user/vendors.csv, 200 rows, same file for all environments
generate $T/authentication/change-request-system-user/vendors.csv orgNo,name \
  organizations -n 200 --columns organizationIdentifier,displayName

# access-management/service-owner/connections/recipients/{at22,at23,tt02}.csv, 200 rows
go run . find organizations -n 200 --env $ENV --format csv --columns organizationIdentifier --out new.csv &&
{ echo recipientType,recipientIdentifier; tail -n +2 new.csv | sed 's/^/organization,/'; } \
  > $T/access-management/service-owner/connections/recipients/$ENV.csv && rm new.csv
```

## Tilretteleggere

Testudo spells the roles `regnskapsfoerer` and `forretningsfoerer`, while the
files use `regnskapsforer` and `forretningsforer`. The recipes fix that.

```bash
fix_spelling() { sed 's/regnskapsfoerer$/regnskapsforer/; s/forretningsfoerer$/forretningsforer/'; }
```

### register/organizations-{at22,at23,tt02}.csv

Ten of each role. The file is also the starting point for the generators in
`access-management/resource-owner/authorized-parties/`.

```bash
K=partyUuid,organizationIdentifier,type
go run . find organizations -r revisor -n 10 --env $ENV --format csv --columns $K --out revisor.csv &&
go run . find organizations -r regnskapsfoerer -n 10 --env $ENV --format csv --columns $K --out regnskapsfoerer.csv &&
go run . find organizations -r forretningsfoerer -n 10 --env $ENV --format csv --columns $K --out forretningsfoerer.csv &&
{ echo organizationUuid,organizationId,type
  tail -q -n +2 revisor.csv regnskapsfoerer.csv forretningsfoerer.csv | fix_spelling; } \
  > $T/register/organizations-$ENV.csv &&
rm revisor.csv regnskapsfoerer.csv forretningsfoerer.csv
```

### authentication/system-user-request/{at22,at23,tt02}.csv

About 50 of each: plain AS companies (`orgType` is `AS`) and the three roles
(`orgType` is the role).

```bash
K=organizationIdentifier,partyId,partyUuid,userId,userPartyUuid,ssn
go run . find organizations -n 50 --env $ENV --format csv --columns $K,unitType --out as.csv &&
go run . find organizations -r revisor -n 50 --env $ENV --format csv --columns $K,type --out revisor.csv &&
go run . find organizations -r regnskapsfoerer -n 50 --env $ENV --format csv --columns $K,type --out regnskapsfoerer.csv &&
go run . find organizations -r forretningsfoerer -n 50 --env $ENV --format csv --columns $K,type --out forretningsfoerer.csv &&
{ echo orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType
  tail -q -n +2 as.csv revisor.csv regnskapsfoerer.csv forretningsfoerer.csv | fix_spelling; } \
  > $T/authentication/system-user-request/$ENV.csv &&
rm as.csv revisor.csv regnskapsfoerer.csv forretningsfoerer.csv
```

### authentication/system-user-client-delegation/{at22,at23,tt02}.csv

Revisorer and regnskapsførere are made again. The forretningsførere must have
property clients, so they are taken from the current file.

```bash
F=$T/authentication/system-user-client-delegation/$ENV.csv
K=organizationIdentifier,partyId,partyUuid,userId,userPartyUuid,ssn,type
grep ',forretningsforer' $F | tr -d '\r' > kept.csv
go run . find organizations -r revisor -n 4 --env $ENV --format csv --columns $K --out revisor.csv &&
go run . find organizations -r regnskapsfoerer -n 3 --env $ENV --format csv --columns $K --out regnskapsfoerer.csv &&
{ echo orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType
  tail -q -n +2 revisor.csv regnskapsfoerer.csv | fix_spelling; cat kept.csv; } > $F &&
rm kept.csv revisor.csv regnskapsfoerer.csv
```

## Generators in K6

Some files are made by k6 scripts that live here in `testdata`, next to the
data they write. They query the APIs that the tests use, and write the rows as
CSV:

| Generator | Writes |
| --- | --- |
| `access-management/consent/consent-data.js` | `access-management/consent/lookup/` |
| `access-management/resource-owner/authorized-parties/subject-lookup-forms-data.js` | `subject-lookup-forms` |
| `access-management/resource-owner/authorized-parties/accounting-firm-data.js` | `clients-and-key-role-parties`, `access-information-flags`, `key-role-filter`, `party-filter`, `resource-filter` |
| `access-management/resource-owner/authorized-parties/subject-only-data.js` | `authorization-boundaries`, `org-code-filter` |

Run them with `k6 run`, e.g.
`k6 run K6/testdata/access-management/resource-owner/authorized-parties/accounting-firm-data.js`.
See the README for the tests for the environment variables they need.

## Cannot be made with testudo

These need data that must already exist in the environment, or parties that
testudo does not find:

- `access-management/enduser/activity-log/yt01.csv`: the organizations are
  chosen because `testdataGeneration/activity-log-data.js` has filled up their
  logs.
- `access-management/resource-owner/authorized-parties/` with
  regnskapsførere and clients (`clients-and-key-role-parties`,
  `access-information-flags`, `key-role-filter`, `party-filter`,
  `resource-filter`): use the generator in
  `access-management/resource-owner/authorized-parties/accounting-firm-data.js`.
- `access-management/enduser/client-delegations-v2/*.csv`: agent, client,
  `roleCode` and `resource` in the same row.
- `authorization/pdp-authorize/` instance delegations and `single-rights`.
- `access-management/consent/lookup`, `get-authorized-parties/for-system-user`,
  `for-user-dialogporten-with-filter`, `dialogporten/serviceowner/should-send-notification`.
- `register/ccr-role-client-*.csv`: needs the clients of the tilrettelegger,
  and testudo does not fetch them.
- `register/register-usernames-*.csv`, `resource-registry/*` and
  `access-management/service-owner/connections/service-owners`.
