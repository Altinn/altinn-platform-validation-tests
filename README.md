# altinn-platform-validation-tests

# Basic Repo Structure

## Important Folders
- The [K6/clients](K6/clients) has API clients to abstract the communication with the different APIs listed in [Altinn Studio Docs](https://docs.altinn.studio/nb/api/).
- The [K6/testdata](K6/testdata) has test data used in the various tests.
- The [K6/api/building-blocks](K6/api/building-blocks) folder has code that wraps the api client calls and does basic http status code checks, tries to parse response bodies, adds retry logic, etc.
- The [K6/api/domain-checks](K6/api/domain-checks) has reusable checks that should be used within the test files themselves (i.e. most checks should be created here and not in the test files themselves).
- The [K6/api/tests](K6/api/tests) has the actual test files.

## Important helpers
- [K6/helpers.js](K6/helpers.js) has misc functions that tend to be useful across tests, such as segmenting data, picking unique data, etc..
- [K6/scopes.js](K6/scopes.js) lists OAuth scopes and provides a simple method to concatenate them.
- [K6/token-generator.js](K6/token-generator.js) and [K6/maskinporten.js](K6/maskinporten.js) both implement the same "interface", which the [K6/clients](K6/clients) use to get a valid token.
- [K6/slack-blacklist.js](K6/slack-blacklist.js) suppresses Slack notifications for known-noisy tests. Add an entry there when a test floods a channel without telling us anything new; the test keeps running and reporting to Grafana either way.

## Important patterns
- We try to follow the same structure as in the [Altinn Studio Docs](https://docs.altinn.studio/nb/api/), which means, if you need to talk to the [Altinn.AccessManagement.Api.Enduser](https://docs.altinn.studio/nb/,api/accessmanagement/enduser/) APIs, you will find the API clients in [K6/clients/access-management/enduser](K6/clients/access-management/enduser), the building-blocks in [K6/api/building-blocks/access-management/enduser](K6/api/building-blocks/access-management/enduser) and the domain-checks in [K6/api/domain-checks/access-management/enduser](K6/api/domain-checks/access-management/enduser). JSDOC types, Builders, etc. are located in the [K6/clients](K6/clients) folders, so, for the same APIs we've been talking about, you can see [K6/clients/access-management/enduser](K6/clients/access-management/enduser), and the domain-checks in [K6/api/domain-checks/access-management/enduser](K6/api/domain-checks/access-management/enduser).
- In general, tests should be able to be run in all environments, so test data should be easy to get, and tests should use [__ENV](https://grafana.com/docs/k6/latest/using-k6/environment-variables/) vars instead of hardcoded values.
- Use the [setup](https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#setup-and-teardown-stages) to declare required env vars, fetch / prepare test data, etc.
- It's usually the case that multiple tests will shared a lot of code. We usually create a `commons.js` with the reusable bits, such as Client initialization, TokenGenerator setup, the setup function, etc.
- When writting tests, we assume that the test will be run as a smoke or breakpoint test sooner or later. So try not to hardcode test data and use the [data object](https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#setup-and-teardown-stages). Exceptions to these are for example tests that simply require you to create a random object that will be sent to the backend, then a simple function call to create the object is enough.
- Every test folder has a `run-all.js` that runs each test in the folder once, which is the quick way to see whether a change to something shared broke anything: `k6 run K6/api/tests/<folder>/run-all.js`.
- Test are run in k8s periodically, by default, functional tests are run every 15 mins or so, smoke tests every hour (Breakpoint tests require a bit more coordination, but the goal is for them to be run once a week and compare how performance evolves over time). These configs are done in the various functional.yaml, smoke.yaml files you will see within the [K6/api/tests](K6/api/tests) folder.


### Notes

- Secrets are managed out-of-band, you simply need to reference them in the config file and they will be available once the test starts (in K8s).
- Start small, start by running functional tests and exploring the dashboards, metrics, logs/reports in [Grafana](https://altinn-grafana-test-b2b8dpdkcvfuhfd3.eno.grafana.azure.com/dashboards/f/eedixo6wu18n4e/?orgId=1).
- The code in this repo should follow the [Swagger docs](https://docs.altinn.studio/nb/api/) as most of the boiler plate is generated from them. When the Swagger docs don't match the actual service's code, use the Swagger nomenclature anyways. Swagger is our source of truth; eventually raise the issue with the team that owns the service(s).

# Available [node types](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dv2-series?tabs=sizebasic#sizes-in-series)

- default         (Standard_D3_v2)
- spot            (Standard_D3_v2)
- spot8cpu28gbmem (Standard_D4_v2)

The default node pool should be fine for functional/low load tests.
The spot node pools should be used when actual performance tests are to be run. Upgrade the tier if the node is incapable of generating enough load. If needed, it's simple to add more nodes and/or more node types.