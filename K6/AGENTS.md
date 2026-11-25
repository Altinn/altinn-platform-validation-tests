# K6: working rules

Read [ADR 0001: How we write K6 tests](../docs/adr/0001-how-we-write-k6-tests.md) before writing or changing a test.

Read the [repo README](../README.md#important-patterns) for structure, helpers and test patterns. Use the [service delegation README](api/tests/access-management/service-owner/connections/README.md) for concrete examples of setup, CSV data, `lazy()` and cleanup.

- Use `setup()` for environment validation and CSV data via `helpers.js`. Pick rows with `getItemFromList()`; don't count iterations yourself or derive the count from the CSV length. Split independent rows with `segmentData(data, getNumberOfVUs())` when several VUs change state.
- `fetchTestData()` reads from GitHub `main` by default, not from local files.
- Put shared setup, clients, token selection, request building and cleanup in the test area's `common.js` (or an existing `commons.js`). Keep the scenario visible in the test file.
- Create clients and the token generator with `lazy()` at module level; reuse them per VU and set the token options for the current row before calling the API. Options are replaced, so include the scopes you need.
- Clients should be simple and follow Swagger/OpenAPI. Use the existing builders for requests and token options; no checks or test flow in the clients.
- Only building blocks check HTTP status and general response validity in the API test flow. Put most reusable domain checks in `api/domain-checks/`.
- Functional: 1 VU / 1 iteration; write separate tests for cases that must always be covered. This refines the README's advice about several iterations to cover a fixture. Smoke: as many iterations as possible within the duration; the number of VUs must be agreed, don't assume 3.
- When changing code: run the relevant lint and type checks (`npm run lint`, `npm run typecheck`). Keep Playwright out of K6 tasks.
- Write identifiers and comments in English. Use Norwegian only where it makes sense for the domain, for example `newTenorClient`, not `nyTenorKlient`.

## Templates

- Service delegation to a [person](api/tests/access-management/service-owner/connections/resource-delegation-to-person.js) and an [organization](api/tests/access-management/service-owner/connections/resource-delegation-to-organization.js), with a shared [common.js](api/tests/access-management/service-owner/connections/common.js): template for scenarios, builders, building blocks, domain checks and `teardown()`. These use one VU; segment the data before using more VUs.
- [Access packages: user-to-user](api/tests/access-management-bff/access-packages/user-to-user.js): example of CSV segmentation per VU.
