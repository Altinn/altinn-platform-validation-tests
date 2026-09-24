# K6: arbeidsregler

Les [CONTRIBUTING.md](CONTRIBUTING.md) før du endrer tester, klienter, testdata eller kjøreprofiler. Den utdyper reglene nedenfor og lenker til konkrete maler.

- Bruk CSV-data og felles setup-hjelpere; kjøreprofilen styrer VU-er og iterasjoner, ikke CSV-lengden.
- Samle delt setup, `lazy()`-klienter, tokenvalg og opprydding i testområdets `common.js` (eller eksisterende `commons.js`). Hold scenarioet synlig i testfilen.
- Klienter skal være enkle og følge Swagger/OpenAPI. Bruk eksisterende builders for forespørsler og token-options.
- Bare building blocks sjekker HTTP-status og generell responsgyldighet i API-testflyten. Legg gjenbrukbare domenesjekker i `api/domain-checks/`.
- Functional: 1 VU / 1 iterasjon. Smoke: flest mulig iterasjoner innen varigheten; antall VU-er må avklares, ikke anta 3.
- Bruk [tjenestedelegering](api/tests/access-management/service-owner/connections/README.md) som mal for lagdeling, `common.js` og separate scenarioer.
- Hold Playwright utenfor K6-oppgaver, og begrens endringer til oppgaven.
