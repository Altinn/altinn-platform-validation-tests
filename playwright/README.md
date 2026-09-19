# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
cd playwright
npm install
npx playwright install
cp example_env/.env.example .env
cp example_env/.env.at23.local.example .env.at23.local
```

Sett `TEST_IDP_PASSWORD` i `.env` for innlogging i prod. Tilgangsverdien hentes fra
teamets hemmelighetsforvaltning. For et annet miljø kopierer du den tilsvarende
miljøfilen fra `example_env/`. Lokale `.env`-filer er gitignorert.

Testpersoner leses fra `<testbrukerPath>/<miljø>.csv`, relativt til `playwright/`, i alle miljøer.
Manglende eller tom fil for en brukergruppe stopper kjøringen før workerne starter.
at23 og tt02 har filer i repoet. For øvrige miljøer må CSV-filer leveres på samme sti, for eksempel
som monterte Kubernetes Secrets. Filene skal ha kolonnene `pid,name`.
Det er ingen fallback til en miljøkonfigurert testperson.
CSV-brukere fordeles mellom workerne innenfor én kjøring; separate kjøringer
deler fortsatt brukerpool.

## Kjør

Ett script per miljø, område oppgis som sti:

```bash
npm run test:at23                          # alt, mot at23 (og at22 / tt02 / prod)
npm run test:at23 -- tests/tilgangsstyring # ett område, én fil eller én :linje
npm run test:at23 -- tests/innlogging --debug   # steppe gjennom tester
```

## Innlogging

`innlogging.logIn(side, user)` bruker ID-porten med TestID i at22, at23 og tt02,
og Mockporten i prod. Miljøet bestemmer mekanismen; det trengs ikke noe eget valg.
TestID-feil i testmiljøene feiler testen, uten fallback til Mockporten.

Tester som kontrollerer innlogging fra en bestemt flate bruker
`viaInnloggingsflyten(landing, user)` etter at de har navigert til startflaten.
Den bruker samme miljøfordeling, og lar testen kontrollere landingen direkte.
Produksjonstestene dekker innlogget sesjon og funksjonalitet med syntetiske
testpersoner, ikke ordinær eID-innlogging.

Utlogging testes bare i at23 og tt02, siden Mockportens utloggingsside svarer 404.
Prod-suiten dekker derfor ikke utlogging.

## Hva kreves på selve spec-filen

Hver spec-fil (testfil) sier selv hvilke miljøer den kan kjøres i, og hvilken
fil den henter testdata fra øverst i fila

```ts
import { Testbruker } from "../../testdata";

runInEnvironment("at22", "at23", "tt02");
test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet }); // eller Testbruker.DagligLeder
```

Nye tester bør minst være kjørt i `at23` og `tt02` og merget og verifisert ok etter merge til main før man legger til prod.

Enumen `Testbruker` i [testdata/index.ts](testdata/index.ts) inneholder mappestiene
relativt til `playwright/`, for eksempel `testdata/privatPersonUtenVirksomhet`.
`ENVIRONMENT=at23` gir da filen [testdata/privatPersonUtenVirksomhet/at23.csv](testdata/privatPersonUtenVirksomhet/at23.csv).
Bruk «Gå til definisjon» på enum-medlemmet for å åpne `testdata/index.ts`,
rett ved siden av mappene med CSV-filer. Hvert medlem har
også dokumentasjonslenker til CSV-filene for at23 og tt02.
Standarden er `Testbruker.PrivatPersonUtenVirksomhet`. Nye brukergrupper legges til
i enumen med mappestien som verdi. Feilstavede enum-navn og fritekstverdier
gir feil i editoren og ved `npm run typecheck`. Playwright typesjekker ikke selv ved kjøring.
Hvem hver test faktisk kjørte som står i rapporten, som `testperson`.
Et miljø som ikke er listet i `runInEnvironment`, skipper testene. Manglende
miljødeklarasjon stopper kjøringen. Prod skal bare legges til for tester som
ikke endrer data.

`npm run typecheck` typesjekker. `npm run report` åpner siste testrapport.

## Språk i page objects

Felles navigasjon og handlinger må fungere på bokmål, nynorsk og engelsk,
også før testen har satt språk: profilen kan ha et lagret språk fra en tidligere
kjøring. Bruk roller og stabile attributter der det er mulig. Når et element må
finnes via tekst, skal selektoren dekke alle tre språk.

Assertions som kontrollerer oversettelser skal derimot bare godta det valgte
språket. Bruk `Record<Sprak, ...>` for forventede tekster og `alleSprak` til å
kjøre språkspesifikke tester. `sprak`-fixturen angir forventningen; den endrer
ikke profilens språk. Testen må selv velge språket før den kontrollerer teksten.
