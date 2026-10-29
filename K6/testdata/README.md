# Testdata

Dette dokumentet viser hvordan CSV-filene her kan lages på nytt med
[testudo](../../helpers/testudo). Bare filene som kan lages med testudo alene er
med. Filer som trenger delegeringer, samtykker, systembrukere eller annet som
må finnes i miljøet fra før, er listet [nederst](#kan-ikke-lages-med-testudo).

> [!WARNING]
> Testudo trekker nye, tilfeldige personer og virksomheter fra Tenor hver gang.
> En fil som lages på nytt får andre identiteter enn i dag, og de samme
> identitetene går ikke lenger igjen på tvers av miljøene. Les
> [Før du erstatter en fil](#før-du-erstatter-en-fil) først, og kjør testene som
> leser filen før du committer.

## Oppsett

Kjør alt fra `helpers/testudo`, med Git Bash eller en annen bash.

Testudo leser nøkler og adresser fra `~/.testudo.yaml` (eller fila du gir med
`--config`). Miljøvariabler med samme navn går foran. Fila skal ikke committes:

```yaml
MASKINPORTEN_CLIENT_ID: '...'
MASKINPORTEN_JWK: '{"kty":"RSA",...}'   # privat nøkkel for Tenor
USERNAME_TEST_API: '...'                # test token generator
PASSWORD_TEST_API: '...'

at23:                                   # én seksjon per miljø: at22, at23, tt02
  API_BASE_URL: 'https://platform.at23.altinn.cloud'
  REGISTER_SUBSCRIPTION_KEY: '...'
```

```bash
cd helpers/testudo
T=../../K6/testdata
ENV=at23   # at22, at23 eller tt02

# lag <fil> <kolonnenavn i filen> <testudo-argumenter>
# Kjører testudo, bytter første linje til kolonnenavnene filen bruker, og
# skriver over filen bare når alt gikk bra.
lag() {
  local fil=$1 header=$2
  shift 2
  go run . tenor "$@" --format csv --ut ny.csv &&
    { echo "$header"; tail -n +2 ny.csv; } > "$fil" && rm ny.csv
}
```

Testudo bruker feltnavnene fra Register (`personIdentifier`, `partyUuid` og så
videre), mens filene her bruker andre navn. Oppskriftene ber derfor om
kolonnene i samme rekkefølge som filen, og `lag` bytter ut første linje.

`--register` slår opp partene i Register for miljøet. Rader der en part ikke
finnes, eller mangler en verdi (for eksempel en person uten bruker), hoppes
over. Filer uten `--register` trenger bare Tenor, og kan derfor også lages
for yt01. Det er ikke sjekket at alle partene finnes i yt01.

Testudo skriver LF-linjeskift, som `.gitattributes` ber om. Flere av filene
her har CRLF i dag, så diffen viser at hver linje er endret.

## Før du erstatter en fil

- **Nye identiteter.** Filene har i dag de samme personene og virksomhetene i
  alle miljøer. Etter en ny generering er det ikke lenger slik.
- **Kjente avhengigheter:**
  - `authentication/change-request-system-user/end-users-<env>.csv` må ha
    raden for 313490114, som har en forhåndsopprettet systembruker med 120
    endringsforespørsler (se `PAGINATION_SYSTEM_ID` i
    `api/tests/authentication/change-request-system-user/commons.js`).
    Oppskriften tar den med.
  - Forretningsførerne i `authentication/system-user-client-delegation` må ha
    eiendomsklienter. Det kan ikke testudo sjekke, så oppskriften beholder dem.
- **Ikke sjekket:** om testene i `access-management-bff/export` forventer at
  partene allerede har delegeringer. Testene som lager egne delegeringer
  (access-packages, single-rights, instance-delegation) trenger det ikke.
- **Etternavn.** Register gir etternavn med store bokstaver. Noen filer har
  små bokstaver i dag.

## Personer

| Filer | Rader i dag |
| --- | --- |
| `portaler/{at23,tt02}/userids.csv` | 10 |
| `access-management/consent/consenter-persons/{at22,at23,tt02}.csv` | 1000 |
| `access-management/enduser/client-delegations-v2/agents/{at22,at23,tt02}.csv` | 20 |

```bash
# Kolonnene er de samme som testudo bruker, så her trengs ikke lag.
go run . tenor personer -n 10 --env $ENV --register --format csv --kolonner userId \
  --ut $T/portaler/$ENV/userids.csv

lag $T/access-management/consent/consenter-persons/$ENV.csv ssn,partyUuid,userId,partyId \
  personer -n 1000 --env $ENV --register --kolonner personIdentifier,partyUuid,userId,partyId

lag $T/access-management/enduser/client-delegations-v2/agents/$ENV.csv pid,partyUuid,partyId,userId,lastName,name \
  personer -n 20 --env $ENV --register --kolonner personIdentifier,partyUuid,partyId,userId,lastName,displayName
```

## Virksomheter med daglig leder

Aksjeselskaper med daglig leder, som er standard i `tenor virksomheter`.
Kolonnene `ssn`, `userId`, `userPartyId`, `userPartyUuid` og `lastName` i
testudo er daglig leder. `partyId` og `partyUuid` er virksomheten.

### pid, partyUuid, orgUuid, orgNo, lastName, …

| Filer | Rader i dag |
| --- | --- |
| `access-management/enduser/request/{at22,at23,tt02}.csv` | 197, 198, 985 |
| `access-management/enduser/activity-log/{at22,at23}.csv` | 10 |

```bash
lag $T/access-management/enduser/request/$ENV.csv pid,partyUuid,orgUuid,orgNo,lastName,userId,partyId \
  virksomheter -n 198 --env $ENV --register \
  --kolonner ssn,userPartyUuid,partyUuid,organizationIdentifier,lastName,userId,userPartyId

lag $T/access-management/enduser/activity-log/$ENV.csv pid,partyUuid,orgUuid,orgNo,lastName \
  virksomheter -n 10 --env $ENV --register \
  --kolonner ssn,userPartyUuid,partyUuid,organizationIdentifier,lastName
```

### ssn, partyUuid, userId, orgUuid, orgNo, lastName, …

| Filer | Rader i dag |
| --- | --- |
| `access-management/enduser/connections/at23.csv` | 9 |
| `access-management/resource-owner/maskinporten-schema/{at23,tt02}.csv` | 9 |
| `access-management-bff/client-admin/open-client-admin/{at23,tt02}.csv` | 9 |
| `access-management-bff/consent/{at23,tt02}.csv` | 9 |

```bash
lag $T/access-management/enduser/connections/at23.csv ssn,partyUuid,userId,orgUuid,orgNo,lastName \
  virksomheter -n 9 --env at23 --register \
  --kolonner ssn,userPartyUuid,userId,partyUuid,organizationIdentifier,lastName

# Det samme for open-client-admin og access-management-bff/consent.
lag $T/access-management/resource-owner/maskinporten-schema/$ENV.csv \
  ssn,partyUuid,userId,orgUuid,orgNo,lastName,userPartyId,partyId \
  virksomheter -n 9 --env $ENV --register \
  --kolonner ssn,userPartyUuid,userId,partyUuid,organizationIdentifier,lastName,userPartyId,partyId
```

### orgNo, partyId, ssn, userId, userPartyId, orgUuid, partyUuid, lastName

Her er `partyId` virksomheten og `partyUuid` daglig leder.

| Filer i `access-management-bff/` og `correspondence/` | Rader i dag |
| --- | --- |
| `access-packages/{org-to-org,user-to-user}/{at23,tt02}.csv` | 5–6 |
| `export/{at23,tt02}/*.csv` (seks filer per miljø) | 5–6 |
| `instance-delegation/{at23,tt02}/{org-user,user-user}.csv` | 505 |
| `single-rights/{at23,tt02}/{org-org,user-user}.csv` | 5 |
| `correspondence/{at23,tt02}/fullmakt-user-user.csv` | 5 |

```bash
V2=orgNo,partyId,ssn,userId,userPartyId,orgUuid,partyUuid,lastName
V2_TESTUDO=organizationIdentifier,partyId,ssn,userId,userPartyId,partyUuid,userPartyUuid,lastName

lag $T/access-management-bff/access-packages/org-to-org/$ENV.csv $V2 \
  virksomheter -n 6 --env $ENV --register --kolonner $V2_TESTUDO
# Det samme for de andre filene i tabellen, med antall rader fra tabellen.
```

### ssn og orgno

Disse trenger ikke Register, og kan derfor også lages for yt01.

| Filer | Rader i dag |
| --- | --- |
| `authorization/pdp-authorize/orgs-dagl-{at22,tt02,yt01}.csv` | 9, 9, 9999 |
| `access-management/resource-owner/get-authorized-parties/{at22,tt02,yt01}.csv` | 9, 9, 9999 |
| `dialogporten/{endusers,graphql,serviceowner}/{at23,tt02,yt01}/endusers.csv` | 28, 97, 2798 |

```bash
lag $T/authorization/pdp-authorize/orgs-dagl-$ENV.csv orgno,ssn \
  virksomheter -n 9 --kolonner organizationIdentifier,ssn

lag $T/access-management/resource-owner/get-authorized-parties/$ENV.csv orgno,ssn \
  virksomheter -n 9 --kolonner organizationIdentifier,ssn

# Merk den omvendte rekkefølgen.
lag $T/dialogporten/endusers/$ENV/endusers.csv ssn,orgno \
  virksomheter -n 28 --kolonner ssn,organizationIdentifier
```

### pid

Personene trenger bare å være noen authorized-parties svarer for. Generatoren i
K6 bruker daglige ledere, så det gjør oppskriften også. Lag filene hver for
seg, så de ikke har de samme personene.

| Filer i `access-management/resource-owner/authorized-parties/` | Rader i dag |
| --- | --- |
| `{authorization-boundaries,org-code-filter}/{at22,at23,tt02,yt01}.csv` | 10 |

```bash
lag $T/access-management/resource-owner/authorized-parties/authorization-boundaries/$ENV.csv pid \
  virksomheter -n 10 --kolonner ssn
lag $T/access-management/resource-owner/authorized-parties/org-code-filter/$ENV.csv pid \
  virksomheter -n 10 --kolonner ssn
```

### subject-lookup-forms

> [!CAUTION]
> Generatoren i K6 (`testdataGeneration/subject-lookup-forms-data.js`) tar bare
> med rader der authorized-parties svarer med en liste som ikke er tom, både
> for personen og virksomheten. Testudo kan ikke sjekke det, så noen rader kan
> bli avvist av testen.

```bash
lag $T/access-management/resource-owner/authorized-parties/subject-lookup-forms/$ENV.csv \
  orgno,orgPartyUuid,pid,userId,partyId,partyUuid \
  virksomheter -n 10 --env $ENV --register \
  --kolonner organizationIdentifier,partyUuid,ssn,userId,userPartyId,userPartyUuid
```

### change-request-system-user/end-users

Raden for 313490114 må være med (se [over](#før-du-erstatter-en-fil)), og
`role` er alltid `dagligleder`.

```bash
K=organizationIdentifier,partyId,partyUuid,unitType,userId,userPartyUuid,ssn
go run . tenor virksomheter -n 1 --kql organisasjonsnummer:313490114 --env $ENV --register \
  --format csv --kolonner $K --ut fast.csv &&
go run . tenor virksomheter -n 199 --env $ENV --register --format csv --kolonner $K --ut ny.csv &&
{ echo orgNo,orgPartyId,orgPartyUuid,orgType,role,userId,userPartyUuid,userPid
  tail -n +2 fast.csv; tail -n +2 ny.csv; } |
  awk -F, -v OFS=, 'NR > 1 { $4 = $4 OFS "dagligleder" } 1' \
  > $T/authentication/change-request-system-user/end-users-$ENV.csv &&
rm fast.csv ny.csv
```

## Virksomheter uten person

```bash
# access-management/consent/consentee-orgs/{at22,at23,tt02,yt01}.csv, 20 rader
lag $T/access-management/consent/consentee-orgs/$ENV.csv orgNo \
  virksomheter -n 20 --kolonner organizationIdentifier

# authentication/change-request-system-user/vendors.csv, 200 rader, samme fil for alle miljøer
lag $T/authentication/change-request-system-user/vendors.csv orgNo,name \
  virksomheter -n 200 --kolonner organizationIdentifier,displayName

# access-management/service-owner/connections/recipients/{at22,at23,tt02}.csv, 200 rader
go run . tenor virksomheter -n 200 --format csv --kolonner organizationIdentifier --ut ny.csv &&
{ echo recipientType,recipientIdentifier; tail -n +2 ny.csv | sed 's/^/organization,/'; } \
  > $T/access-management/service-owner/connections/recipients/$ENV.csv && rm ny.csv
```

## Tilretteleggere

Testudo staver rollene `regnskapsfoerer` og `forretningsfoerer`, mens filene
bruker `regnskapsforer` og `forretningsforer`. Oppskriftene retter det.

```bash
staving() { sed 's/regnskapsfoerer$/regnskapsforer/; s/forretningsfoerer$/forretningsforer/'; }
```

### register/organizations-{at22,at23,tt02}.csv

Ti av hver rolle. Filen er også utgangspunktet for generatorene i
`api/tests/access-management/resource-owner/authorized-parties/testdataGeneration`.

```bash
K=partyUuid,organizationIdentifier,type
go run . tenor virksomheter -r revisor -n 10 --env $ENV --register --format csv --kolonner $K --ut revisor.csv &&
go run . tenor virksomheter -r regnskapsfoerer -n 10 --env $ENV --register --format csv --kolonner $K --ut regnskapsfoerer.csv &&
go run . tenor virksomheter -r forretningsfoerer -n 10 --env $ENV --register --format csv --kolonner $K --ut forretningsfoerer.csv &&
{ echo organizationUuid,organizationId,type
  tail -q -n +2 revisor.csv regnskapsfoerer.csv forretningsfoerer.csv | staving; } \
  > $T/register/organizations-$ENV.csv &&
rm revisor.csv regnskapsfoerer.csv forretningsfoerer.csv
```

### authentication/system-user-request/{at22,at23,tt02}.csv

Rundt 50 av hver: vanlige AS-er (`orgType` er `AS`) og de tre rollene
(`orgType` er rollen).

```bash
K=organizationIdentifier,partyId,partyUuid,userId,userPartyUuid,ssn
go run . tenor virksomheter -n 50 --env $ENV --register --format csv --kolonner $K,unitType --ut as.csv &&
go run . tenor virksomheter -r revisor -n 50 --env $ENV --register --format csv --kolonner $K,type --ut revisor.csv &&
go run . tenor virksomheter -r regnskapsfoerer -n 50 --env $ENV --register --format csv --kolonner $K,type --ut regnskapsfoerer.csv &&
go run . tenor virksomheter -r forretningsfoerer -n 50 --env $ENV --register --format csv --kolonner $K,type --ut forretningsfoerer.csv &&
{ echo orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType
  tail -q -n +2 as.csv revisor.csv regnskapsfoerer.csv forretningsfoerer.csv | staving; } \
  > $T/authentication/system-user-request/$ENV.csv &&
rm as.csv revisor.csv regnskapsfoerer.csv forretningsfoerer.csv
```

### authentication/system-user-client-delegation/{at22,at23,tt02}.csv

Revisorer og regnskapsførere lages på nytt. Forretningsførerne må ha
eiendomsklienter, så de hentes fra filen som ligger der.

```bash
F=$T/authentication/system-user-client-delegation/$ENV.csv
K=organizationIdentifier,partyId,partyUuid,userId,userPartyUuid,ssn,type
grep ',forretningsforer' $F | tr -d '\r' > ff.csv
go run . tenor virksomheter -r revisor -n 4 --env $ENV --register --format csv --kolonner $K --ut revisor.csv &&
go run . tenor virksomheter -r regnskapsfoerer -n 3 --env $ENV --register --format csv --kolonner $K --ut regnskap.csv &&
{ echo orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType
  tail -q -n +2 revisor.csv regnskap.csv | staving; cat ff.csv; } > $F &&
rm ff.csv revisor.csv regnskap.csv
```

## Kan ikke lages med testudo

Disse trenger data som må finnes i miljøet fra før, eller parter testudo ikke
finner:

- yt01-variantene av filene over som trenger `--register`. Testudo kjenner bare
  at22, at23 og tt02.
- `access-management/enduser/activity-log/yt01.csv`: virksomhetene er valgt
  fordi `testdataGeneration/activity-log-data.js` har fylt opp loggene deres.
- `access-management/resource-owner/authorized-parties/` med
  regnskapsførere og klienter (`clients-and-key-role-parties`,
  `access-information-flags`, `key-role-filter`, `party-filter`,
  `resource-filter`): bruk `testdataGeneration/accounting-firm-data.js`.
- `access-management/enduser/client-delegations-v2/*.csv`: agent, klient,
  `roleCode` og `resource` i samme rad.
- `authorization/pdp-authorize/` instansdelegeringer og `single-rights`.
- `access-management/consent/lookup`, `get-authorized-parties/for-system-user`,
  `for-user-dialogporten-with-filter`, `dialogporten/serviceowner/should-send-notification`.
- `register/ccr-role-client-*.csv`: testudo har ikke organisasjonsformen til
  klienten som kolonne.
- `register/register-usernames-*.csv`, `resource-registry/*` og
  `access-management/service-owner/connections/service-owners`.
