# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp example_env/at23.sh .env.at23.local    # og tt02.sh / prod.sh ved behov
```

Fyll inn `TEST_IDP_PASSWORD` i fila, og `TEST_USER_PID` for tt02 og prod, der
testbrukeren ikke er sjekket inn. Fødselsnummeret må være syntetisk, altså
Tenor-nummer med måned 81-92. Filene er gitignorert.

## Kjør

```bash
npm test                             # alt, mot at23
npm run test:tt02                    # alt, mot tt02
npm run test:prod                    # alt, mot prod

npm run test:tilgangsstyring         # ett område, mot at23
npm run test:tilgangsstyring:prod    # samme område, mot prod
```

Miljøet velges med `ENVIRONMENT`, som scriptene setter, og bestemmer hvilken
`.env.<miljø>.local` som leses. Malene i `example_env/` kan også sources i shellet
slik k6-testene gjør det. Alt etter `--` går videre til Playwright:

```bash
npm test -- tests/tilgangsstyring --grep bokmål --headed
```

`npm run typecheck` typesjekker, og `npx playwright show-report` åpner rapporten.

## Struktur

Ett hovedområde per mappe, med en fil per underside og en fixture som samler dem:

```
pages/tilgangsstyring/forside.ts     fixtures/tilgangsstyring.fixture.ts
pages/arbeidsflate/{forside,profil}.ts
pages/felles/                        meny og innlogging
flows/innlogging.ts                  innlogging, på tvers av flatene
config/                              miljøvariabler og språk
```

En test tar områdene den trenger som fixtures:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring.forside, user);
    await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
});
```

En ny underside er en page object i områdets mappe pluss ett felt i fixturen.

## Innlogging

`innlogging.logIn(side, user)` lander innlogget på siden du sender inn. Mekanismen
ligger i `pages/felles/syntetisk-innlogging.ts` og skal ikke lekke ut i testene.
Flyten må starte på Altinns login-endepunkt, siden `state` opprettes serverside; en
authorize-URL kan ikke skrives for hånd eller gjenbrukes.

Testene i `tests/innlogging/` bruker `innlogging.viaIdporten`, siden det er
innloggingsflyten gjennom ID-porten de tester.
