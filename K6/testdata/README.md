# Test data

CSV files the k6 tests read in `setup`, one folder per group of clients, next to the tests that use them.

## Conventions

- **One file per environment.** Party ids, uuids and user ids differ between environments, so a row is only valid in
  the environment the file is for. The environment is in the file name (`organizations-at23.csv`) or the folder
  (`at23/user-user.csv`); the tests pick the file from `__ENV.ENVIRONMENT`.
- **Read from `main`, not from disk.** `fetchTestData` in `K6/helpers.js` fetches the file over HTTP from the `main`
  branch, so a change takes effect when it is merged. For a local run against data that is still on a branch, set
  `TESTDATA_BRANCH=<branch>`. A missing or empty file fails the test in `setup`.
- **Header row first.** Column names are camelCase and follow the names already in use: `orgNo`, `partyId`,
  `partyUuid`, `orgUuid`, `ssn`/`pid`, `userId`.
- **Data belongs to the tests.** New or changed files go in the same branch and pull request as the tests that read
  them, with a README in the folder that says what each file and column is and how to regenerate it.
- **Synthetic data only, and no secrets.** Persons and organizations come from Tenor. The Tenor CLI in
  `altinn-access-management-frontend/playwright/tenor` fetches them and can enrich them with their Altinn parties from
  Register; see its README for the commands and the Maskinporten client it needs. Tokens, keys and subscription keys
  never go in these files.

## Folders

Each folder has its own README when the files need explaining. For example
[resource-registry/README.md](resource-registry/README.md) describes the resources and the organizations the
resource-registry tests use.
