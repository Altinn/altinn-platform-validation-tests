# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp .env.example .env
```

Fyll inn `TEST_IDP_PASSWORD`, og `TEST_USER_PID` og `TEST_USER_NAME` for miljøet du
kjører mot. Fødselsnummeret må være syntetisk, altså Tenor-nummer med måned 81-92.
`.env` og `.env.local` er gitignorert.

## Kjør

Scriptene kjører ett miljø, og område oppgis som sti:

```bash
npm run test:at23                              # alt, mot at23 (og tt02 / prod)
npm run test:prod -- tests/tilgangsstyring     # ett område, én fil eller én :linje
npm run test:at23 -- tests/innlogging --debug  # Playwright-flagg etter --
```

`npm run typecheck` typesjekker, og `npm run report` åpner rapporten fra forrige
kjøring. Den skrives til `playwright-report/` hver gang, men åpner seg ikke selv.
I VS Code-utvidelsen velger du miljø under Projects.

## Miljøer

Alt som skiller miljøene, står i `miljoer` i `playwright.config.ts`: URLene og om
innloggingen går via Mockporten. Hvert miljø blir ett project per nettleser, for
eksempel `at23-chromium`, og foreløpig er bare Chrome med.

En test sier selv hvilke miljøer den er klar for, med en tag per miljø:

```ts
test("...", { tag: ["@at23", "@tt02"] }, async ({ innlogging }) => { ... });
```

Et project kjører bare testene som har taggen for miljøet sitt. En test uten tag kjører
ingen steder, så en ny test må forfremmes bevisst. Prod skal bare ha testen når den er
verifisert i at23 og tt02, og ikke endrer data.

## Struktur

Ett hovedområde per mappe, med en fil per underside og en fixture som samler dem:

```
tests/tilgangsstyring/               testene for området
pages/tilgangsstyring/forside.ts     page objects, en fil per underside
fixtures/tilgangsstyring.fixture.ts  samler undersidene til én fixture
pages/felles/                        meny og innlogging, brukt av alle
flows/innlogging.ts                  innlogging, på tvers av flatene
config/                              miljøvariabler og språk
```

En test tar områdene den trenger som fixtures, og en ny underside er en page object
pluss ett felt i fixturen:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring.forside, user);
    await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
});
```

Språk er en option-fixture med bokmål som default, satt med
`test.use({ sprak: Sprak.Nynorsk })` per test eller describe-blokk. Områdefixturene
får språket injisert, så `assertSections` slår opp riktige navn selv.

## Innlogging

`innlogging.logIn(side, user)` lander innlogget på siden du sender inn. Mekanismen
ligger i `pages/felles/syntetisk-innlogging.ts` og skal ikke lekke ut i testene.
Flyten må starte på Altinns login-endepunkt, siden `state` opprettes serverside; en
authorize-URL kan ikke skrives for hånd eller gjenbrukes.

Testene i `tests/innlogging/` bruker `innlogging.viaIdporten`, siden det er
innloggingsflyten gjennom ID-porten de tester.
