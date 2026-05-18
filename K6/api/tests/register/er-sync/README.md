# ER Sync Tests

Verifies that data submitted to the Enhetsregisteret (ER) via SOAP is correctly synced to Altinn Register. Each test submits a **prep** state (creates the organization), then a **change**, and finally verifies the change is reflected in Register.

## Running

```bash
# Run all tests
k6 run run-all.js -e ENVIRONMENT=at22 -e BASE_URL=https://platform.at22.altinn.cloud \
  -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> -e REGISTER_SUBSCRIPTION_KEY=<key>

# Stop after prep (seed state, inspect manually in portal)
k6 run change-styr.js -e STOP_AFTER_PREP=true <env vars>
k6 run run-all.js     -e STOP_AFTER_PREP=true <env vars>
```

### Required environment variables

| Variable | Description |
|---|---|
| `ENVIRONMENT` | Target environment, e.g. `at22`, `tt02` |
| `BASE_URL` | Base URL for the Register API |
| `SOAP_ER_USERNAME` | Username for the ER SOAP endpoint |
| `SOAP_ER_PASSWORD` | Password for the ER SOAP endpoint |
| `REGISTER_SUBSCRIPTION_KEY` | Subscription key for the Register API |