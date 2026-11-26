# ADR 0001: How we write K6 tests

Status: Draft, to be validated with the Auth team
Date: 2026-11-02

## Context

New contributors tend to make the same mistakes, and fixing them takes several review rounds. Going through roughly 300 review comments from earlier PRs shows three recurring themes: each test handles test data its own way, tests are written as detailed unit tests without reusable domain checks, and clients and building blocks drift from Swagger or from how responsibilities are split in this repo.

## Decision

### 1. Test data is loaded in `setup()` and drawn with the helpers

`setup()` validates the environment with `requireEnv()` and loads fixtures with `fetchTestData()` from `K6/testdata/<area>/<environment>.csv`. The test draws one row per iteration with `getItemFromList()`, and splits rows with `segmentData(data, getNumberOfVUs())` when several VUs change state. Don't write your own random picking, don't `forEach` over the whole fixture, and don't count iterations yourself.

Shared setup such as clients (via `lazy()`), token options, request building and cleanup goes in the folder's `common.js`. The test file should only show the scenario. Check `K6/helpers.js` before writing a new helper; `pickUnique`, `retry`, `lazy`, `sameSet` and more are already there.

Use synthetic Tenor organizations and persons, not real ones. If the arrange step in setup fails, stop the run with `fail()` instead of checking for it in every test.

### 2. Tests describe the domain, not the API

A test is a scenario seen from the domain, such as "the service owner delegates a resource to a person", not a walk through every field of every response. The layers are:

- **Client** (`K6/clients`): one method per Swagger operation, no checks.
- **Building block** (`K6/api/building-blocks`): calls the client, checks the status code and that the body has the right shape, and returns the parsed domain object.
- **Domain check** (`K6/api/domain-checks`): reusable assertions about the domain, with static names so they can be followed in Grafana.
- **Test** (`K6/api/tests`): draws data, calls building blocks and domain checks.

If you need a new check, put it in domain checks so the next test can use it. A case that must always be covered gets its own test file, not a loop or an `if` inside one test.

### 3. Follow Swagger and the repo conventions

Clients, methods and parameters are named and typed as in Swagger, even when Swagger is odd. Raise mismatches with the team that owns the service. VUs and iterations are set in `functional.yaml` and `smoke.yaml`, not in the test. Code and comments are written in English, with Norwegian only where it makes sense for the domain (`newTenorClient`, not `nyTenorKlient`). Generated comments and `console.log` are cleaned up before the PR.

## Template

Start from [resource-delegation-to-person.js](../../K6/api/tests/access-management/service-owner/connections/resource-delegation-to-person.js) and its [common.js](../../K6/api/tests/access-management/service-owner/connections/common.js). Together they show setup, CSV data, `lazy()`, building blocks, domain checks and `teardown()`.

## Consequences

Reviews can focus on the domain instead of structure, and domain checks accumulate so new tests get shorter. The cost is that the first test in a new area takes a bit more work, since its building blocks and domain checks have to exist first.
