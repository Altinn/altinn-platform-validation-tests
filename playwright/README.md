# Playwright-tester for Altinn-flatene

Tester innlogging og tilgangsstyring på arbeidsflate, profil, tilgangsstyring og
infoportalen.

## Kom i gang

```bash
npm install
npx playwright install
cp example_env/at23.env .env.at23.local    # og tt02.env / prod.env ved behov
```

Fyll inn `TEST_IDP_PASSWORD` i fila, og `TEST_USER_PID` for tt02 og prod, der
testbrukeren ikke er sjekket inn. Fødselsnummeret må være syntetisk, altså
Tenor-nummer med måned 81-92. Filene er gitignorert.

## Kjør

```bash
npm run test:at23                    # alt, mot at23
npm run test:tt02                    # alt, mot tt02
npm run test:prod                    # alt, mot prod

npm run test:tilgangsstyring:at23    # ett område, mot at23
npm run test:tilgangsstyring:prod    # samme område, mot prod
npm run test:innlogging:at23         # og tilsvarende for innlogging
```

`npm test` uten miljø i navnet kjører mot det `ENVIRONMENT` sier, med at23 som
default.

Miljøet velges med `ENVIRONMENT`, som scriptene setter, og bestemmer hvilken
`.env.<miljø>.local` som leses. Vil du heller ha verdiene i shellet, slik k6-testene
gjør det, virker malene der også: `set -a && . example_env/prod.env && set +a`.

`--headed`, `--grep=`, `--workers=` og `--retries=` virker rett på scriptene:

```bash
npm run test:tilgangsstyring:prod --headed --grep=bokmål
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
og det er samtidig anledningen til å sjekke at testen virker der.

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
