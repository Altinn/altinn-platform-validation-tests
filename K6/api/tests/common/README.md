# Shared test helpers

`smoke.js` holds what a read-only smoke test needs and that no single family
owns: strict k6 options, per-environment configuration with env var overrides,
and token generators for a service owner or an end user.

## Adding a smoke test for a client family

A smoke test proves that every client in a family still builds a request the
API accepts. It is not a business flow: read-only calls only, one iteration,
and it must pass in at least one of `at23` and `tt02`. Issue #582 lists the
families that still need one.

Create `K6/api/tests/<family>/` with these files. `storage/` and `events/`
are the reference implementations.

1. `commons.js`: a `TEST_CONFIGURATION` table with the org, app, user or
   other identifiers per environment, resolved through `getSmokeConfiguration`
   so every value can be overridden by an env var. Put the client factories
   here too, wrapped in `lazy` from `helpers.js` so each VU builds them once.
2. One test file per group of related read-only calls. Each file exports
   `options` built with `getSmokeOptions`, a `setup` that resolves the
   configuration (so a missing value fails before any request is sent), and a
   default function that calls the building blocks under
   `K6/api/building-blocks/<family>/`. Wrap each step in a k6 `group` with a
   label object, so the step shows up on its own in the metrics.
3. `run-all.js`: imports every test file's `setup` and default export and runs
   them in one k6 run. Copy `storage/run-all.js`.
4. `functional.yaml`: one `test_definitions` entry per test file, with a
   context per environment the test has data for.
5. `README.md`: which clients the folder covers, which methods are left out and
   why, and the env vars an ad hoc run can set.

Clients that can only be exercised with a write, or that need data nobody has
in a test environment, are listed in the folder's README rather than skipped
silently.

## Running locally

```powershell
. .\.conf\at23.ps1
k6 run K6/api/tests/storage/run-all.js
```

The `.conf` files are gitignored and set `ENVIRONMENT`, `BASE_URL` and the
token generator credentials. Override a configuration value for one run by
setting its env var, for example `$env:STORAGE_ORG = "digdir"`.
