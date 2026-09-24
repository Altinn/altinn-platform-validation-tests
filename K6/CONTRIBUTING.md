# K6: testmønstre og arbeidsregler

## Testdata og setup

- Bruk miljøspesifikke CSV-filer med header under `K6/testdata/` og hjelperne i [helpers.js](helpers.js).
- I `setup()`: valider med `requireEnv()`, hent med `fetchTestData()` og returner serialiserbare data, ikke klientinstanser.
- Ved flere VU-er som endrer tilstand: fordel uavhengige rader med `segmentData(data, getNumberOfVUs())`. Hver VU velger fra `segmentedData[exec.vu.idInTest - 1]` med `getItemFromList()`.
- `getItemFromList()` gjenbruker radene gjennom iterasjonene. Ikke lag egne tellere, kjør hele CSV-en i hver iterasjon eller sett iterasjonsantall ut fra CSV-lengden. Ha minst én rad per VU ved segmentering, og unngå at VU-er endrer samme entitet.
- `fetchTestData()` leser fra GitHub `main` som standard, ikke lokale filer. Annen publisert branch kan angis som tredje argument. Tjenestedelegeringens `common.js` støtter også `TEST_DATA_BASE_URL` for sine fixtures.
- Rydd opp testopprettet tilstand også ved feil, med avgrensning til testens egne data. Bruk `teardown()` der oppryddingen skal skje etter kjøringen.

## Felles oppsett i common.js

- Samle det søstertestene deler i områdets `common.js`: setup, testdatatyper/-utvalg, scopes, klientoppsett, token-options, request-bygging med builders og opprydding. Bruk eksisterende navn der mappen allerede har `commons.js`; ikke opprett en parallell hjelpefil.
- Eksporter felles `setup` og gjeneksporter den fra testfilene. La hver test vise scenario, steg/labels, building-block-kall og domain checks. Ikke gjem hele testen i en generell hjelpefunksjon.
- Definer `getClients = lazy(() => { ... })` på modulnivå i fellesfilen med `lazy()` fra `helpers.js`. Opprett klienter og token-generator inne i callbacken, og kall `getClients()` fra testflyten.
- Instanser og token-cache gjenbrukes per VU, ikke mellom VU-er eller fra setup. Del token-generator bare når klientene skal bruke samme autentiseringskontekst; separate samtidige identiteter trenger separate generatorer.
- Sett token-options for aktuell rad før API-kall. `setTokenGeneratorOptions()` erstatter options, så inkluder også nødvendige scopes.

## Ansvar mellom lagene

- **Clients (`clients/`):** Enkle wrappers som følger Swagger/OpenAPI og returnerer HTTP-responsen. Gjenbruk builders for body, query og token-options; følg deres eksisterende metodenavn. Ingen checks, statuskodevalidering eller testflyt.
- **Building blocks (`api/building-blocks/`):** Eneste laget i API-testflyten som sjekker HTTP-status og generell responsgyldighet, også ved forventede feil. Kall klienten, håndter retry ved behov og returner parsede data. Felles infrastrukturhjelpere håndterer egne transportfeil.
- **Domain checks (`api/domain-checks/`):** Mesteparten av gjenbrukbare, domenespesifikke checks hører hjemme her. Ta inn parsede data og forventninger; ingen HTTP-kall eller statuskodesjekker.
- **Tester (`api/tests/`):** Orkestrer scenarioet med felles oppsett, builders, building blocks, domain checks og opprydding. `common.js` erstatter ikke de andre lagenes ansvar.

## Eksempler å følge

- Tjenestedelegering til [person](api/tests/access-management/service-owner/connections/resource-delegation-to-person.js) og [organisasjon](api/tests/access-management/service-owner/connections/resource-delegation-to-organization.js): små, separate scenarioer med builders, building blocks, domain checks og `teardown()`.
- Tilhørende [common.js](api/tests/access-management/service-owner/connections/common.js) og [README](api/tests/access-management/service-owner/connections/README.md): delt setup, CSV-fixtures, `lazy()` og opprydding. Testene bruker foreløpig én VU; legg til segmentering før flere VU-er skal endre disse dataene.
- [Domain checks for tjenestedelegering](api/domain-checks/access-management/service-owner/connections.js) og [building block for opprettelse](api/building-blocks/access-management/service-owner/connections/connections-create-resource.js): konkret skille mellom domeneforventninger og HTTP-/parsevalidering.
- [Access packages: user-to-user](api/tests/access-management-bff/access-packages/user-to-user.js): eksempel på CSV-segmentering per VU og `lazy()`; bruk tjenestedelegering som mal for øvrig struktur.

## Kjøreprofiler og verifisering

- `smoke.yaml`: Flest mulig iterasjoner innen konfigurert varighet. Antall VU-er er uavklart (3 er foreslått, ikke bekreftet); behold eksisterende profil inntil videre.
- `functional.yaml`: 1 VU, 1 iterasjon per testkjøring. Dette kjører ikke automatisk alle CSV-rader. Lag separate tester for tilfeller som alltid skal dekkes, slik person og organisasjon er skilt i tjenestedelegering.
- Kjøreinnstillinger kommer fra runner/`config_file`, ikke testlogikken. Eksisterende overstyringer kan avvike; ikke endre uvedkommende profiler.
- Ved K6-kodeendringer: kjør relevante lint-/typesjekker (`npm run lint`, `npm run typecheck`). Skill eksisterende feil fra egne. Dokumentasjonsendringer krever ikke API-testkjøring.
