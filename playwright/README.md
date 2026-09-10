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

Sett `TEST_IDP_PASSWORD` i `.env` for Mockporten-testen. Tilgangsverdien hentes fra
teamets hemmelighetsforvaltning. For et annet miljø kopierer du den tilsvarende
miljøfilen fra `example_env/`. Lokale `.env`-filer er gitignorert.

Testpersoner leses fra `testdata/<testbrukerPath>/<miljø>.csv` i alle miljøer.
En tom fil gir feil. at23 og tt02 har filer i repoet; hvordan øvrige testdatafiler
skal leveres som secrets, er ikke bestemt ennå.

Når filen mangler, brukes foreløpig `TEST_USER_PID` og `TEST_USER_NAME` fra
miljøfilen. Når en brukergruppe mangler CSV, velger oppsettet automatisk én worker.
Fallbacken gir samme person uavhengig av brukergruppe. Personen må derfor passe til testen du velger å kjøre.
Når CSV-filen blir tilgjengelig, brukes den automatisk uten kodeendringer.
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

`tests/innlogging/mockporten.spec.ts` tester Mockporten eksplisitt én gang per
miljøkjøring, i alle fire miljøer. Den logger inn én gang og kontrollerer sesjonen
på tvers av flatene. I prod bruker også de øvrige innloggede testene Mockporten.
Utlogging testes bare i at23 og tt02, siden Mockportens utloggingsside svarer 404.
Prod-suiten dekker derfor ikke utlogging.

## Hva kreves på selve spec-filen

Hver spec-fil (testfil) sier selv hvilke miljøer den kan kjøres i, og hvilken
fil den henter testdata fra øverst i fila

```ts
runInEnvironment("at22", "at23", "tt02");
test.use({ testbrukerPath: "privatPersonUtenVirksomhet" }); // eller "dagligLeder"
```

Nye tester bør minst være kjørt i `at23` og `tt02` og merget og verifisert ok etter merge til main før man legger til prod.

Testpersonene ligger i `testdata/`, og standarden er `privatPersonUtenVirksomhet`.
Hvem hver test faktisk kjørte som står i rapporten, som `testperson`.
Et miljø som ikke er listet i `runInEnvironment`, skipper testene. Manglende
miljødeklarasjon stopper kjøringen. Prod skal bare legges til for tester som
ikke endrer data.

`npm run typecheck` typesjekker. `npm run report` åpner siste testrapport.
