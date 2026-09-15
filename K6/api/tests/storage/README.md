# Storage smoke tests

Read-only smoke tests for the clients under `K6/clients/storage/`, added for
issue #582. They prove the clients still build requests Storage accepts; they
do not exercise instance flows.

- `get-applications.js` lists ttd's applications with `ApplicationsClient`,
  reads one of them, and reads its `nb` text resource with `TextsClient`.
- `query-instances.js` asks `InstancesClient` for one instance owned by ttd's
  apps, without data elements.

Run every test in one go with `run-all.js`.

## Clients not covered here

`DataClient`, `InstanceEventsClient`, `ProcessClient` and `SignClient` only
have methods that need an existing instance to read, or that write. They get a
test once a stable instance in a test environment is agreed on; see #582.

## Configuration

Defaults exist for `at23` and `tt02`. Override them for one run with:

- `STORAGE_ORG`, the service owner whose apps and instances are read
  (default `ttd`).
- `STORAGE_LANGUAGE`, the text resource language (default `nb`).
- `STORAGE_APP`, the app the per-app calls go to. Unset by default, in which
  case the first app in the org list is used.

`ENVIRONMENT`, `BASE_URL`, `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD` come from the shared test runner, or from a `.conf`
file locally.
