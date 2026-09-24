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
ligger per miljø i [miljo.ts](miljo.ts).

Testpersoner leses fra `<testbrukerPath>/<miljø>.csv`, relativt til `playwright/`, i alle miljøer.
Manglende eller tom fil for en brukergruppe feiler testene i miljøet før noen av dem starter.
at23 og tt02 har filer i repoet. For øvrige miljøer må CSV-filer leveres på samme sti, for eksempel
som monterte Kubernetes Secrets. Filene skal ha kolonnene `pid,name`.
Det er ingen fallback til en miljøkonfigurert testperson.
CSV-brukere fordeles mellom workerne innenfor én kjøring; separate kjøringer
deler fortsatt brukerpool.

## Kjør

Hvert miljø er et Playwright-[project](https://playwright.dev/docs/test-projects), og
scriptene velger ett av dem. Område oppgis som sti:

```bash
npm run test:at23                          # alt, mot at23 (og at22 / tt02 / prod)
npm run test:at23 -- tests/tilgangsstyring # ett område, én fil eller én :linje
npm run test:at23 -- tests/innlogging --debug   # steppe gjennom tester
npx playwright test --project=at23 --project=tt02   # flere miljøer i samme kjøring
```

I VS Code-utvidelsen velger du miljø under Projects.

## Innlogging

`innlogging.logIn(side, user)` bruker ID-porten med TestID i at22, at23 og tt02,
og Mockporten i prod. Miljøet bestemmer mekanismen; det trengs ikke noe eget valg.
TestID-feil i testmiljøene feiler testen, uten fallback til Mockporten.
Er ID-porten nede, kan du bruke Mockporten i alle miljøer med `npm run test:at23 --mockporten`,
eller `MOCKPORTEN=true` foran `npx playwright test`.
Mockporten testes også for seg i at23, tt02 og prod, i `tests/innlogging/innlogging-mockporten.spec.ts`.

Tester som kontrollerer innlogging fra en bestemt flate bruker
`viaInnloggingsflyten(landing, user)` etter at de har navigert til startflaten.
Den bruker samme miljøfordeling, og lar testen kontrollere landingen direkte.
Produksjonstestene dekker innlogget sesjon og funksjonalitet med syntetiske
testpersoner, ikke ordinær eID-innlogging.

Utlogging testes bare i at23 og tt02, siden Mockportens utloggingsside svarer 404.
Prod-suiten dekker derfor ikke utlogging.

## Hva kreves på selve spec-filen

Hver test sier selv hvilke miljøer den kan kjøres i, med `miljoer(...)` som gir
testen en tag per miljø. Projectene i `playwright.config.ts` velger testene på
taggen. Hvilken fil testdata hentes fra settes øverst i fila:

```ts
import { Testbruker } from "../../testdata";
import { miljoer } from "../../miljo";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet }); // eller Testbruker.DagligLeder

test("...", miljoer("at23", "tt02"), async ({ innlogging, user }) => { ... });
```

`miljoer(...)` kan også stå på en `test.describe`, og gjelder da alle testene i blokken.

Nye tester bør minst være kjørt i `at23` og `tt02` og merget og verifisert ok etter merge til main før man legger til prod.

Enumen `Testbruker` i [testdata/index.ts](testdata/index.ts) inneholder mappestiene
relativt til `playwright/`, for eksempel `testdata/privatPersonUtenVirksomhet`.
Projectet `at23` gir da filen [testdata/privatPersonUtenVirksomhet/at23.csv](testdata/privatPersonUtenVirksomhet/at23.csv).
Bruk «Gå til definisjon» på enum-medlemmet for å åpne `testdata/index.ts`,
rett ved siden av mappene med CSV-filer. Hvert medlem har
også dokumentasjonslenker til CSV-filene for at23 og tt02.
Standarden er `Testbruker.PrivatPersonUtenVirksomhet`. Nye brukergrupper legges til
i enumen med mappestien som verdi. Feilstavede enum-navn og fritekstverdier
gir feil i editoren og ved `npm run typecheck`. Playwright typesjekker ikke selv ved kjøring.
Hvem hver test faktisk kjørte som står i rapporten, som `testperson`.
Et miljø som ikke er listet i `miljoer`, kjører ikke testen. En spec-fil uten
`miljoer` stopper kjøringen i `global-setup.ts`. Prod skal bare legges til for tester som
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
