# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp example_env/at23.env .env.at23.local    # og at22 / tt02 / prod ved behov
```

Fyll inn `TEST_IDP_PASSWORD` i fila, og `TEST_USER_PID` for tt02 og prod, der
testbrukeren ikke er sjekket inn. Fødselsnummeret må være syntetisk, altså
Tenor-nummer med måned 81-92. Filene er gitignorert.

## Kjør

Ett script per miljø, og område oppgis som sti:

```bash
npm run test:at23                             # alt, mot at23
npm run test:tt02                             # og at22 / prod tilsvarende

npm run test:prod -- tests/tilgangsstyring    # ett område
npm run test:at23 -- tests/innlogging         # eller én fil, eller én :linje
```

Scriptet setter `ENVIRONMENT`, som bestemmer hvilken `.env.<miljø>.local` som leses.
`npm test` uten miljø i navnet bruker `ENVIRONMENT` fra shellet, med at23 som default.
Malene kan også legges i shellet i stedet, slik k6-testene gjør det:
`set -a && . example_env/prod.env && set +a`.

`--headed`, `--grep=`, `--workers=` og `--retries=` virker rett på scriptene:

```bash
npm run test:prod --headed --grep=bokmål
```

Bruk likhetstegn på dem som tar en verdi, ellers tolker npm neste ord som eget
argument. Alt annet, og en fritt valgt sti, sendes etter `--`:

```bash
npm run test:at23 -- tests/tilgangsstyring --debug
```

`npm run typecheck` typesjekker, og `npx playwright show-report` åpner rapporten.

## Hvilke miljøer en test støtter

Hele suiten kan kjøres mot alle miljøer. Hver testfil sier selv hvilke miljøer den
er kjent å virke i, øverst i fila:

```ts
import { test, kjoresIMiljoer } from '../../fixtures/test';

kjoresIMiljoer('at22', 'at23', 'tt02', 'prod');
```

Kjører du mot et miljø som ikke står i lista, rapporteres testene som skipped med
begrunnelsen `Kjøres i at22, at23, tt02, ikke i prod`. De feiler ikke, og de
forsvinner ikke stille. `npm run test:prod` gir i dag 3 passed og 8 skipped:
tilgangsstyring-testen støtter prod, mens innloggingstestene bruker TestID hos
ID-porten, som bare finnes i testmiljøene.

Glemmer du kallet, kjører fila i alle miljøer. Det er ikke en feil, men det betyr at
ingen har tatt stilling til spørsmålet, så ta det med når du skriver en ny test.

Anbefalingen for en ny test er minst `at23` og `tt02`, og at du faktisk har kjørt den
der før du fører dem opp:

```bash
npm run test:at23
npm run test:tt02
```

Legg til `prod` når testen er verifisert der også. Vær varsom: en test som endrer
data hører ikke hjemme i prod. Kommer et nytt miljø til, må det legges inn i fila,
og det er samtidig anledningen til å sjekke at testen virker der. `kjoresIMiljoer`
ligger i `fixtures/test.ts`, og miljøene som finnes er listet i `config/miljo.ts`.

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

En test tar områdene den trenger som fixtures:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring.forside, user);
    await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
});
```

En ny underside er en page object i områdets mappe pluss ett felt i fixturen.

## Språk

Språk er en option-fixture med bokmål som default. Settes per test eller per
describe-blokk:

```ts
import { Sprak } from '../../config/sprak';

test.describe('på nynorsk', () => {
    test.use({ sprak: Sprak.Nynorsk });

    test('...', async ({ innlogging, user, tilgangsstyring, sprak }) => {
        await innlogging.setLanguage(sprak);
    });
});
```

Områdefixturene får språket injisert, så assertions som avhenger av det, for eksempel
`assertSections`, slår opp riktige navn selv. Se
`tests/tilgangsstyring/tilgjengelige-seksjoner.spec.ts`, som kjører samme test for
alle språkene i `alleSprak`.

## Innlogging

`innlogging.logIn(side, user)` lander innlogget på siden du sender inn. Mekanismen
ligger i `pages/felles/syntetisk-innlogging.ts` og skal ikke lekke ut i testene.
Flyten må starte på Altinns login-endepunkt, siden `state` opprettes serverside; en
authorize-URL kan ikke skrives for hånd eller gjenbrukes.

Testene i `tests/innlogging/` bruker `innlogging.viaIdporten`, siden det er
innloggingsflyten gjennom ID-porten de tester.
