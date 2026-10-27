# Activity log (aktivitetslogg)

Performance tests for the activity log endpoints of the
[Access Management Enduser API v2](https://docs.altinn.studio/nb/api/accessmanagement/enduser/v2-incl-activitylog/).

Each of the three areas, `connections`, `request` and `maskinporten`, has the same four endpoints
under `/accessmanagement/api/v2/enduser/<area>/activitylog`:

| Endpoint | Test |
| --- | --- |
| `GET /activitylog` | `get-<area>-activity-log-to.js` and `get-<area>-activity-log-from.js`: read the first page of an organization's log in one direction |
| `GET /activitylog` with `typeId`, `after` and `before` | `get-<area>-activity-log-filtered.js`: reads the log filtered on one activity type and the last 90 days, a new type each iteration |
| `GET /activitylog/filter/{field}`, with and without `term` | `get-<area>-activity-log-filter-values.js`: lists the values of one filter field, then searches them with `term`, a new field each iteration |
| `GET /activitylog/types` | `get-<area>-activity-log-metadata.js` (no token or token generator credentials) |
| `GET /activitylog/filter/fields` | `get-<area>-activity-log-metadata.js` (no token or token generator credentials) |

## What is checked

Besides status 200 and a parseable body (the building blocks), the tests check the content with
[`domain-checks/access-management/enduser/activity-log.js`](../../../../domain-checks/access-management/enduser/activity-log.js)
and [`domain-checks/common/pagination.js`](../../../../domain-checks/common/pagination.js):

- **Log:** `data` is a list, every entry has `id`, `when` and a valid `type`, `subtype` and `trigger`,
  and every entry belongs to the organization on the side the direction asks for (`toId` with `To`,
  `fromId` with `From`). Where the test data guarantees entries (see below), the list must not be empty.
- **Filtered log:** as for the log, and every entry is of the filtered type (a type without a status
  covers its entries in any status) and inside the `after`/`before` window.
- **Filter values:** `data` is a list and every value has an `id`. A `term` search only returns values
  whose name contains the term, ignoring case, and returns the value the term was taken from.
- **Filter fields:** each area offers exactly the fields it is expected to.
- **Types:** each area lists at least one type, each with an `id` and a valid `type`.

## Test data

The filtered and filter-value tests read the direction the test data holds entries in: `From` for
`connections` and `maskinporten`, `To` for `request`. Reading the other direction would measure an empty
log. The filtered tests pick among the activity types the generated data holds.

Each row is an organization (`orgUuid`) and its daglig leder (`pid`, `partyUuid`), who reads the
organization's log with an `altinn:portal/enduser` token. The tests only read, so the rows are not split
per VU, and a run can use more VUs than there are rows.

**yt01** reads
[`testdata/access-management/enduser/activity-log/yt01.csv`](../../../../../testdata/access-management/enduser/activity-log/yt01.csv):
10 organizations whose logs were filled by
[`testdataGeneration/activity-log-data.js`](testdataGeneration/activity-log-data.js) on 2026-10-21
(10 organizations × 15 rounds). Each holds about 160–190 `connections` `From` entries (one about 1000),
125–150 `request` `To` and 30 `maskinporten` `From`, so the first two span more than one page of 100.

**Elsewhere** (at22) the tests read the "be om tilgang" users in
[`testdata/access-management/enduser/request/<env>.csv`](../../../../../testdata/access-management/enduser/request/).
What their logs held in a scan of every user in October 2026:

| Log | Has entries | Typical size |
| --- | --- | --- |
| `connections` `From` | all users | 10–40 entries |
| `connections` `To` | about 80% | 0–1 entries |
| `request` `To` | all users | 20–50 entries |
| `request` `From` | none | empty |
| `maskinporten` `To` and `From` | none | empty |

So `connections` `From` and `request` `To` are required to hold entries in every environment.

### Filling more logs

[`testdataGeneration/activity-log-data.js`](testdataGeneration/activity-log-data.js) gives a set of
organizations a round of events per iteration (roles, access packages, package requests that are
approved, rejected and withdrawn, maskinporten suppliers) and removes everything it created, so only the
log entries remain. It writes data, so agree with the team before running it, and start with
`ORGS=1 ROUNDS=1`:

```sh
ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud ORGS=10 ROUNDS=15 \
  k6 run K6/api/tests/access-management/enduser/activity-log/testdataGeneration/activity-log-data.js
```

The teardown prints the organizations as csv for `activity-log/<env>.csv`. It covers 11 of the 39
activity types `GET …/activitylog/types` lists; resources, client delegations, instances and draft
requests are not generated yet.

## Where it runs

The activity log is deployed to **at22** and **yt01** (at23 and tt02 answer 404).

- `functional.yaml` and `smoke.yaml` run on a schedule in yt01 and at22. To pause yt01, for example
  while another team loads data there, set `enabled: false` under its context.
- `breakpoint.yaml` points at yt01, like the other access-management breakpoint configs.
- yt01 uses the users in `request/yt01.csv`; their tokens are accepted in yt01 already.

## Running locally

Source the env vars of the environment (see [example_env](../../../../../example_env/README.md)); you
need `TOKEN_GENERATOR_USERNAME` and `TOKEN_GENERATOR_PASSWORD`. From the repo root:

```sh
export ENVIRONMENT=at22
export BASE_URL=https://platform.at22.altinn.cloud

# every test once, to check nothing is broken
k6 run K6/api/tests/access-management/enduser/activity-log/run-all.js

# one test, 10 VUs for 5 minutes
k6 run --vus 10 --duration 5m K6/api/tests/access-management/enduser/activity-log/get-connections-activity-log-from.js

# breakpoint style: ramp up to 50 VUs over 10 minutes
k6 run --stage 10m:50 K6/api/tests/access-management/enduser/activity-log/get-request-activity-log-filter-values.js
```

`RANDOMIZE=false` walks the users in order instead of picking them at random. Until the yt01 csv is on
`main`, run `npm run serve` and set `USE_LOCAL_TEST_DATA=true` to read it from your checkout. `TRACE_CALL=true` adds a
`traceparent` header so a slow request can be found in the service's logs.
