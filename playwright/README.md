# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp .env.example .env
```

`TEST_IDP_PASSWORD` trengs bare når projectet har `mockporten: true`, altså i
praksis prod. `.env` og `.env.local` er gitignorert.

Testbrukerne leses fra `testdata/<gruppe>/<miljø>.csv`, og hver worker får sin egen
bruker. `prod.csv` er gitignorert, siden prod-brukerne ikke kan sjekkes inn.
`TEST_DATA_PATH` peker på en annen testdata-mappe med samme oppbygning, for eksempel
en som er montert inn i poden.

## Kjør

Scriptene kjører ett miljø, og område oppgis som sti:

```bash
npm run test:at23                              # alt, mot at23 (og tt02 / prod)
npm run test:at23:bokmaal                      # lokalt: bare bokmål og Chrome
npm run test:prod -- tests/tilgangsstyring     # ett område, én fil eller én :linje
npm run test:at23 -- tests/innlogging --debug  # Playwright-flagg etter --
```

`npm run typecheck` typesjekker, og `npm run report` åpner rapporten fra forrige
kjøring. Den skrives til `playwright-report/` hver gang, men åpner seg ikke selv.
I VS Code-utvidelsen velger du miljø under Projects.

## Miljøer

Alt som skiller miljøene, står i `miljoer` i `playwright.config.ts`: URLene og om
innloggingen går via Mockporten. Hvert miljø blir ett project per nettleser og
språk, for eksempel `at23-chromium-nynorsk`, og foreløpig er bare Chrome med.

En test sier selv hvilke miljøer den er klar for, med en tag per miljø:

```ts
test("...", { tag: ["@at23", "@tt02"] }, async ({ innlogging }) => { ... });
```

Et project kjører bare testene som har taggen for miljøet sitt. En test uten tag kjører
ingen steder, så en ny test må forfremmes bevisst. Prod skal bare ha testen når den er
verifisert i at23 og tt02, og ikke endrer data.

## Struktur

Ett hovedområde per mappe, med en page object per underside:

```
tests/tilgangsstyring/               testene for området
pages/tilgangsstyring/forside.ts     page objects, en fil per underside
pages/felles/                        meny og innlogging, brukt av alle flatene
config/                              miljøvariabler og språk
fixtures/arbeidsflate.fixture.ts     én fixture per område: arbeidsflate,
fixtures/tilgangsstyring.fixture.ts  tilgangsstyring, infoportal og innlogging
fixtures/infoportal.fixture.ts
fixtures/innlogging.fixture.ts
fixtures/testbrukere.fixture.ts      testbrukerne fra testdata/
fixtures/test.ts                     slår dem sammen med mergeTests
```

Hver fixture-fil har ett ansvar og extender `base` fra Playwright, aldri en annen
fixture-fil. Testene importerer `test` fra `fixtures/test.ts` og ingen andre steder.
Et nytt ansvar, for eksempel API-klienter, er en ny fil og én linje i `mergeTests`.

En test tar sidene den trenger som fixtures, og en ny side er en page object pluss
ett felt i områdets fixture:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring, user);
    await tilgangsstyring.assertSections(forventedeSeksjoner);
});
```

Språket er en del av projectet, så `npm run test:<miljø>` kjører alle testene på
bokmål, nynorsk og engelsk. Lokalt holder det som regel med bokmål og Chrome, og det
er det `npm run test:<miljø>:bokmaal` kjører. Sidene får språket injisert,
så `assertSections` slår opp riktige navn selv.

## Innlogging

`innlogging.logIn(side, user)` logger inn og lander på siden du sender inn. Om det
skjer via ID-porten med TestID eller via Mockporten styres bare av `mockporten` i
miljøets project, siden TestID ikke finnes i prod. Testene vet ikke hvilken.
Begge veiene starter på Altinns login-endepunkt, siden `state` opprettes serverside.

`innlogging.logOut()` logger ut via menyen. Språket settes med
`tilgangsstyring.meny.setLanguage(sprak)`, på menyen til siden du står på.

