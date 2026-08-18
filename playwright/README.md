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
config/environment.ts                      URLer, testbruker og hemmeligheter
```

En test tar områdene den trenger som fixtures, og går rett på undersiden:

```ts
test('...', async ({ innlogging, user, tilgangsstyring }) => {
    await innlogging.withMockporten(tilgangsstyring.forside, user);
    await tilgangsstyring.forside.assertSectionsAreVisible(sections);
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

## Hemmeligheter og miljø

URLene og testbrukerne for testmiljøene ligger i `.env.at23` og `.env.at22`, som er
sjekket inn. Prod har `.env.prod` med URLene, men uten testbruker.

Hemmeligheter ligger i to gitignorerte filer:

* `.env` for det som gjelder alle miljøer. Kopier `.env.example` og fyll inn
  `TEST_IDP_PASSWORD`, det delte tilgangspassordet til Test-IDP ("mockporten").
  Test-IDP-en låser seg globalt etter fem feilforsøk, så testene feiler med en gang
  passordet mangler i stedet for å prøve seg fram.
* `.env.prod.local` for prod-brukeren. Kopier `.env.prod.local.example` og fyll inn
  `TEST_USER_PID` og `TEST_USER_NAME`. Fødselsnummeret må være syntetisk, altså
  Tenor-nummer med måned 81-92.

dotenv overstyrer aldri en variabel som allerede er satt. Presedensen blir derfor
ekte env (Kubernetes) foran `.env.<miljø>.local` foran `.env.<miljø>` foran `.env`.
Miljøfila vinner over `.env`, så en verdi du legger i `.env` gjelder bare miljøene
som ikke har sin egen.

## Kjør

at23 er default, og prod har egne scripts:

```bash
npm test                             # alt, mot at23
npm run test:prod                    # alt, mot prod
npm run test:innlogging              # innloggingstestene, mot at23
npm run test:tilgangsstyring         # tilgangsstyring, mot at23
npm run test:tilgangsstyring:prod    # tilgangsstyring, mot prod
```

Alt etter `--` går videre til Playwright, så enkelttester og feilsøkingsflagg
fungerer som normalt:

```bash
npm run test:prod -- tests/tilgangsstyring --grep bokmål --headed
npm test -- tests/innlogging/innlogging-alle-flater.spec.ts
```

Andre miljøer settes med `TEST_ENV`, som scriptene bare er en snarvei for:

```bash
TEST_ENV=at22 npx playwright test tests/tilgangsstyring
```

Rapporten åpnes med `npx playwright show-report`.

## Innlogging

Innlogging går via Test-IDP-en, som Altinn Authentication ruter til når
`iss=mockporten` er med i login-URLen. Flyten må starte på Altinns eget
login-endepunkt, se `getLoginUrl` i `config/environment.ts`: `state` opprettes
serverside per innlogging, så en authorize-URL mot mockporten kan ikke skrives for
hånd eller gjenbrukes. Gjør du det, svarer Altinn
`Unknown or expired upstream state`.

Test-IDP-en godtar bare syntetiske Tenor-fødselsnummer, altså måned 81-92.
