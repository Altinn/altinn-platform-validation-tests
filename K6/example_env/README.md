# Env

## Local runs with dotenv files (no sourcing)

Requires k6 (`brew install k6` on macOS) and Node.js 22.16+ with built-in
`util.parseEnv`. No `npm install` is needed for the runner; k6 downloads the
JavaScript libraries imported by the tests over HTTPS.

From the repository root, copy `.env.at23.example` to `.env.at23`. Fill in the
variables required by your test, including `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD` for tests using the token generator. Then run:

```sh
# A single test (this public endpoint needs no credentials)
npm run k6 -- at23 K6/api/tests/resource-registry/get-updated-resources.js

# An existing folder suite
npm run k6 -- at23 K6/api/tests/authentication/change-request-system-user/run-all.js

# Pass options to k6
npm run k6 -- at23 K6/api/tests/resource-registry/get-updated-resources.js --vus 1 --iterations 1

# Validate imports without making test API requests
npm run k6 -- at23 K6/api/tests/resource-registry/get-updated-resources.js --inspect
```

Both the environment and test path are required. Paths are resolved from the
repository root. The runner loads `.env.<environment>` on every invocation and
runs the selected file with k6, preserving its exit status. Tests declare their
own required variables and thresholds. The example sets one VU and one iteration;
edit these values or pass k6 flags to change the load.

File values override inherited environment variables and do not change your
shell. Local `.env.*` files are ignored by Git; `.env.*.example` templates can be
committed. Quote values containing `#`. Values are parsed as dotenv, not executed
as shell code, and `${VARIABLE}` expansion is not supported.

For another environment, copy the template to `.env.tt02`, for example, update
`ENVIRONMENT`, `DEPLOY_ENV`, `ENV_TYPE`, URLs and credentials, and use
`npm run k6 -- tt02 K6/api/tests/<folder>/<test>.js`. If the file declares
`ENVIRONMENT`, it must match the environment passed to the runner. The checked-in
shell examples below document the corresponding environment URLs.

## Running tests in different environments
We usually source the correct env vars before running k6 tests.
An example in Linux is:
- Copy the example env files (.ps1 if you use windows) somewhere, for example your home folder.
- Fill out any secrets, or missing env vars you might want/need.
- Add an alias to your bashrc (or equivalent) `alias at23='source ~/.scripts/at23.sh'` (`. .\at23.ps1` if you are using windows)
- Whenever you want to run a test, you can then do `at23` to load the proper env vars, and then run the k6 tests with `k6 run <...>`

## Running more than one test at a time

Every test folder has a `run-all.js` that calls each test in the folder once, so
`k6 run K6/api/tests/<folder>/run-all.js` covers the folder in one run. A folder
whose test data only exists in one environment fails elsewhere, so point it at the
environment its tests were written for.


## Env vars available in K8s
- The source of truth is [here](https://github.com/Altinn/altinn-platform/blob/main/infrastructure/adminservices-test/altinn-monitor-test-rg/k6_tests_rg_configs.tf).
- To those, there can be extra env vars that will be available at test runtime via [k8s secrets](https://kubernetes.io/docs/concepts/configuration/secret/), e.g. `TOKEN_GENERATOR_USERNAME` and `TOKEN_GENERATOR_PASSWORD` and any other Secret needed to run the test that was configured in the `.yaml` files.
