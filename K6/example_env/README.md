# Env

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
