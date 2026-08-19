# Playwright-tester for Altinn-flatene

Testene dekker innlogging og tilgangsstyring på tvers av arbeidsflate, profil,
tilgangsstyring og infoportalen.

Koden er organisert per hovedområde. Hvert område har en mappe under `pages/` med
en fil per underside, og en fixture-fil under `fixtures/` som samler undersidene:

```
pages/arbeidsflate/{forside,profil}.ts     fixtures/arbeidsflate.fixture.ts
pages/tilgangsstyring/forside.ts           fixtures/tilgangsstyring.fixture.ts
pages/infoportal/forside.ts                fixtures/infoportal.fixture.ts
pages/felles/                              meny og innlogging, brukt av alle
flows/innlogging.ts                        innlogging, som går på tvers av flatene
config/environment.ts                      miljøvariablene testene trenger
```

En test tar områdene den trenger som fixtures, og går rett på undersiden:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.logIn(tilgangsstyring.forside, user);
    await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
});
```

En ny underside er da to ting: en page object i områdets mappe, og ett felt i
områdets fixture. Testene som går på tvers av flatene importerer `testMedFlater`
i stedet, og får et oppslag fra flatenavn til side.

## Installer

```bash
npm install
npx playwright install
```

## Miljø og hemmeligheter

Alt kommer fra miljøvariabler, samme konvensjon som k6-testene: du sourcer et miljø
før du kjører. `example_env/at23.sh` og `example_env/prod.sh` er malene. Kopier dem
et sted utenfor repoet, fyll inn hemmelighetene, og lag gjerne et alias slik
`K6/example_env/README.md` beskriver.

Variablene som må være satt:

| Variabel | Merknad |
| --- | --- |
| `AF_UI_BASE_URL`, `AM_UI_BASE_URL`, `INFO_CLOUD_URL` | Samme navn som i k6-testene |
| `PLATFORM_BASE_URL` eller `BASE_URL` | `BASE_URL` er platform-URLen i k6-testene |
| `TEST_USER_PID` | Syntetisk Tenor-fnr, altså måned 81-92 |
| `TEST_USER_NAME` | Bare testene som slår opp navnet på skjermen trenger den |
| `TEST_IDP_PASSWORD` | Delt tilgangspassord for innlogging som syntetisk bruker |

Testbrukeren i prod skal ikke sjekkes inn noe sted. I Kubernetes kommer variablene
fra configmap og secrets på samme måte som for k6.

## Kjør

Miljøet bestemmes av det du har sourcet, ikke av kommandoen:

```bash
source ~/.scripts/playwright-at23.sh
npm test                        # alt
npm run test:innlogging         # innloggingstestene
npm run test:tilgangsstyring    # tilgangsstyring
```

Alt etter `--` går videre til Playwright, så enkelttester og feilsøkingsflagg
fungerer som normalt:

```bash
npm test -- tests/tilgangsstyring --grep bokmål --headed
npm test -- tests/innlogging/innlogging-alle-flater.spec.ts
```

Rapporten åpnes med `npx playwright show-report`.

## Innlogging

Testene logger inn med `innlogging.logIn(side, user)`, som lander innlogget på siden
du sender inn. Mekanismen er samlet i `pages/felles/syntetisk-innlogging.ts` og skal
ikke lekke ut i testene: Altinn Authentication ruter til en syntetisk-only upstream
når `iss` er med i login-URLen, og den godtar bare syntetiske Tenor-fødselsnummer.

Flyten må starte på Altinns eget login-endepunkt. `state` opprettes serverside per
innlogging, så en authorize-URL kan ikke skrives for hånd eller gjenbrukes; gjør du
det, svarer Altinn `Unknown or expired upstream state`.

Testene i `tests/innlogging/` bruker i stedet `innlogging.viaIdporten`, siden det er
selve innloggingsflyten gjennom ID-porten de tester.
