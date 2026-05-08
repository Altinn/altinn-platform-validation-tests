# altinn-platform-validation-tests

# Adding tests

1 - Look into the [clients](K6/clients) folder to see if there is already a client for the API you need to use. If there is, proceed to the next step, otherwise go to [Altinn Studio docs](https://docs.altinn.studio/nb/api/) and create the Client for the API you need.

2 - A lot of tests end up making similar basic checks so it is recommended, although not mandatory, to have an intermediate layer for those types of checks. So far, these layers have been put into the  [building_blocks](K6/api/building_blocks) folder.

3 - Now you can start to write the actual tests, which are in the [tests](K6/api/tests) folder.


# General recommendations

- Make sure tests are able to run in every environment. Do not, as much as possible, create tests that can only be run in a single environment.
- Avoid hardcoding values as much as possible. e.g. values such as the BASE_URL, ALTINN2_BASE_URL, AM_UI_BASE_URL, ENVIRONMENT (at22, yt01, tt02, etc.) will be available at runtime. If there are other envvars that are reusable across teams, we can add them [here](https://github.com/Altinn/altinn-platform/blob/f546f2447021da6d2338863707f734c041145e45/infrastructure/adminservices-test/altinn-monitor-test-rg/k6_tests_rg_configs.tf#L13-L17).
- Other envvars you might need, make them configurable, i.e. rely on [__ENV](https://grafana.com/docs/k6/latest/using-k6/environment-variables/) and pass them on in the [custom config file](conf/authentication-break.yaml).
- Secrets are managed out-of-band, you simply need to reference them in the config file and they will be available once the test starts (in K8s).
- Start small, start by running functional tests and exploring the dashboards, metrics, logs/reports in [Grafana](https://altinn-grafana-test-b2b8dpdkcvfuhfd3.eno.grafana.azure.com/dashboards/f/eedixo6wu18n4e/?orgId=1).

# Basic Repo Structure

```
├── K6
│   ├── api
│   │   ├── building_blocks
│   │   │   ├── authentication
│   │   │   │   ├── systemRegister
│   │   │   │   │   ├── createNewSystem.js
│   │   │   │   │   ├── deleteSystem.js
│   │   │   │   │   ├── getDeletedSystemById.js
│   │   │   │   │   ├── getSystemById.js
│   │   │   │   │   ├── getSystemRights.js
│   │   │   │   │   ├── getSystems.js
│   │   │   │   │   ├── index.js
│   │   └── tests
│   │       ├── authentication
│   │       │   ├── systemRegister
│   │       │   │   ├── systemRegisterAccessPackages.js
│   │       │   │   ├── systemRegisterCrud.js
│   │       │   │   └── systemRegisterRights.js
│   ├── clients
│   │   ├── authentication
│   │   │   ├── index.js
│   │   │   ├── systemRegister.js
│   │   │   └── ...
│   ├── commonImports.js
│   ├── helpers.js
│   └── testdata
│       ├── authentication
│       │   ├── ...
└── conf
    ├── authentication-break.yaml
    ├── authentication.yaml
```

# Available [node types](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dv2-series?tabs=sizebasic#sizes-in-series)

- default         (Standard_D3_v2)
- spot            (Standard_D3_v2)
- spot8cpu28gbmem (Standard_D4_v2)

The default node pool should be fine for functional/low load tests.
The spot node pools should be used when actual performance tests are to be run. Upgrade the tier if the node is incapable of generating enough load. If needed, it's simple to add more nodes and/or more node types.