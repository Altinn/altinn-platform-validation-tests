# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
cd playwright
npm install
npx playwright install
cp example_env/.env.example .env
```

Sett `TEST_IDP_PASSWORD` i `.env` for innlogging med Mockporten. Tilgangsverdien hentes fra
teamets hemmelighetsforvaltning. Lokale `.env`-filer er gitignorert. URLene til flatene
ligger i miljøets project i [playwright.config.ts](playwright.config.ts).

Testpersoner leses fra `testdata/<brukergruppe>/<miljø>.csv`, relativt til `playwright/`, i alle miljøer.
Manglende eller tom fil for en brukergruppe feiler testene i miljøet før noen av dem starter.
at23 og tt02 har filer i repoet. Prod-brukerne kan ikke sjekkes inn, og monteres fra secreten
`playwright-testdata-prod` med én nøkkel per brukergruppe, for eksempel `dagligLeder.csv`.
`TESTDATA_ROOT` sier hvor de ligger, se `hack/playwright-cronjobs.jsonnet`. Filene skal ha kolonnene `pid,name`.
Det er ingen fallback til en miljøkonfigurert testperson.
CSV-brukere fordeles mellom workerne innenfor én kjøring; separate kjøringer
deler fortsatt brukerpool.

## Kjør

Hvert miljø er et Playwright-[project](https://playwright.dev/docs/test-projects), og
scriptene velger ett av dem. Område oppgis som sti:

```bash
npm run test:at23                          # alt, mot at23 (og tt02 / prod)
npm run test:at23 -- tests/tilgangsstyring # ett område, én fil eller én :linje
npm run test:at23 -- tests/innlogging --debug   # steppe gjennom tester
npx playwright test --project=at23 --project=tt02   # flere miljøer i samme kjøring
```

I VS Code-utvidelsen velger du miljø under Projects.

## Innlogging

`innlogging.logIn(side, user)` bruker ID-porten med TestID i at23 og tt02,
og Mockporten i prod. Miljøet bestemmer mekanismen; det trengs ikke noe eget valg.
TestID-feil i testmiljøene feiler testen, uten fallback til Mockporten.
Er ID-porten nede, kan du bruke Mockporten i alle miljøer med `MOCKPORTEN=true npm run test:at23`.
`innlogging-alle-flater.spec.ts`, som tester innloggingen gjennom ID-porten, kjøres da ikke.
Mockporten testes også for seg i at23, tt02 og prod, i `tests/innlogging/innlogging-mockporten.spec.ts`.

Tester som kontrollerer innlogging fra en bestemt flate bruker
`viaInnloggingsflyten(landing, user)` etter at de har navigert til startflaten.
Den bruker samme miljøfordeling, og lar testen kontrollere landingen direkte.
Produksjonstestene dekker innlogget sesjon og funksjonalitet med syntetiske
testpersoner, ikke ordinær eID-innlogging.

Utlogging testes bare i at23 og tt02, siden Mockportens utloggingsside svarer 404.
Prod-suiten dekker derfor ikke utlogging.

## Hva kreves på selve spec-filen

Hvilke miljøer en spec kjører i står i miljøets project i `playwright.config.ts`.
En ny spec kjører i at23 og tt02 uten videre. tt02 hopper over det som ikke er
kjørt ut der ennå med `testIgnore`, og prod kjører bare filene som er ført opp i
`testMatch`.

En test ber om testpersonen den trenger ved navn, så det står i testen selv
hvilke testdata den bruker:

```ts
test("...", async ({ innlogging, dagligLeder, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring.forside, dagligLeder);
});
```

Fixturene er `privatPerson` og `dagligLeder`, se `fixtures/testbruker.fixture.ts`.

Nye tester bør minst være kjørt i `at23` og `tt02` og merget og verifisert ok etter merge til main før de føres opp i prod-projectet.

Brukergruppene står i enumen `Testbruker` i [testdata/index.ts](testdata/index.ts),
med mappestien som verdi, for eksempel `testdata/dagligLeder`. Projectet `at23`
gir da filen [testdata/dagligLeder/at23.csv](testdata/dagligLeder/at23.csv).
En ny brukergruppe trenger en mappe med CSV-filer, et medlem i enumen og en
fixture i `fixtures/testbruker.fixture.ts`, og i prod en nøkkel i secreten og i
`hack/playwright-cronjobs.jsonnet`.
Hvem hver test faktisk kjørte som står i rapporten, som `testperson`.
Prod skal bare legges til for tester som
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
