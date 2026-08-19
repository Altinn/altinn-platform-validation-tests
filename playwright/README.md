# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp example_env/at23.env .env.at23.local    # og at22 / tt02 / prod ved behov
```

Fyll inn `TEST_IDP_PASSWORD`, og `TEST_USER_PID` for tt02 og prod, der testbrukeren
ikke er sjekket inn. Fødselsnummeret må være syntetisk, altså Tenor-nummer med måned
81-92. `.env.*.local` er gitignorert.

## Kjør

Ett script per miljø, område oppgis som sti:

```bash
npm run test:at23                          # alt, mot at23 (og at22 / tt02 / prod)
npm run test:prod tests/tilgangsstyring    # ett område, én fil eller én :linje
npm run test:at23 --headed --grep=bokmål   # flagg med verdi trenger likhetstegn
npm run test:at23 -- tests/innlogging --debug   # øvrige flagg etter --
```

Scriptet setter `ENVIRONMENT`, som bestemmer hvilken `.env.<miljø>.local` som leses.
Verdiene kan også ligge i shellet, slik k6-testene gjør det:
`set -a && . example_env/prod.env && set +a`.

`npm run typecheck` typesjekker, og `npx playwright show-report` åpner rapporten.

## Prod er opt-in

`test:prod` kjører med `--grep=@prod`, så bare tester som er eksplisitt merket kjøres
mot prod. En ny test kan ikke havne der ved en forglemmelse, og peker du prod-scriptet
på en utagget mappe, får du "no tests found".

Merk en testfil eller et describe-blokk når den er verifisert mot prod, og bare hvis
den ikke endrer data:

```ts
test.describe('Tilgangsstyring', { tag: '@prod' }, () => { ... });
```

I testmiljøene kjører alt uten merking, så nye tester bør minst være kjørt i `at23` og
`tt02` først.

## Struktur

Ett hovedområde per mappe, med en fil per underside og en fixture som samler dem:

```
tests/tilgangsstyring/               testene for området
pages/tilgangsstyring/forside.ts     page objects, en fil per underside
fixtures/tilgangsstyring.fixture.ts  samler undersidene til én fixture
pages/felles/                        meny og innlogging, brukt av alle
flows/innlogging.ts                  innlogging, på tvers av flatene
config/                              miljøvariabler, miljøliste og språk
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
