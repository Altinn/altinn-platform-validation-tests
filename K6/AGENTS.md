# K6: arbeidsregler

Les [repoets README](../README.md#important-patterns) for struktur, hjelpere og testmønstre. Bruk [tjenestedelegeringens README](api/tests/access-management/service-owner/connections/README.md) for konkrete eksempler på setup, CSV-data, `lazy()` og opprydding.

- Bruk `setup()` til miljøvalidering og CSV-data via `helpers.js`. Velg rader med `getItemFromList()`; ikke tell iterasjoner selv eller sett antallet ut fra CSV-lengden. Fordel uavhengige rader med `segmentData(data, getNumberOfVUs())` når flere VU-er endrer tilstand.
- `fetchTestData()` leser som standard fra GitHub `main`, ikke lokale filer.
- Samle delt setup, klienter, tokenvalg, request-bygging og opprydding i testområdets `common.js` (eller eksisterende `commons.js`). Hold scenarioet synlig i testfilen.
- Opprett klienter og token-generator med `lazy()` på modulnivå; gjenbruk per VU og sett token-options for aktuell rad før API-kall. Options erstattes, så ta med nødvendige scopes.
- Klienter skal være enkle og følge Swagger/OpenAPI. Bruk eksisterende builders for forespørsler og token-options; ingen checks eller testflyt i klientene.
- Bare building blocks sjekker HTTP-status og generell responsgyldighet i API-testflyten. Legg mesteparten av gjenbrukbare domenesjekker i `api/domain-checks/`.
- Functional: 1 VU / 1 iterasjon; lag separate tester for tilfeller som alltid skal dekkes. Dette presiserer README-ens råd om flere iterasjoner for å dekke en fixture. Smoke: flest mulig iterasjoner innen varigheten; antall VU-er må avklares, ikke anta 3.
- Ved kodeendringer: kjør relevante lint-/typesjekker (`npm run lint`, `npm run typecheck`). Hold Playwright utenfor K6-oppgaver.

## Maler

- Tjenestedelegering til [person](api/tests/access-management/service-owner/connections/resource-delegation-to-person.js) og [organisasjon](api/tests/access-management/service-owner/connections/resource-delegation-to-organization.js), med delt [common.js](api/tests/access-management/service-owner/connections/common.js): mal for scenarioer, builders, building blocks, domain checks og `teardown()`. Disse bruker én VU; segmenter data før flere VU-er brukes.
- [Access packages: user-to-user](api/tests/access-management-bff/access-packages/user-to-user.js): eksempel på CSV-segmentering per VU.
