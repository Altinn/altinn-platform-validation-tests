# Activity log (aktivitetslogg)

Performance tests for the activity log endpoints of the
[Access Management Enduser API v2](https://docs.altinn.studio/nb/api/accessmanagement/enduser/v2-incl-activitylog/).

Each of the three areas, `connections`, `request` and `maskinporten`, has the same four endpoints
under `/accessmanagement/api/v2/enduser/<area>/activitylog`:

| Endpoint | Test |
| --- | --- |
| `GET /activitylog` | `get-<area>-activity-log.js`: reads the first page of an organization's log, direction `To` and `From` |
| `GET /activitylog/filter/{field}` | `get-<area>-activity-log-filter-values.js`: lists the values of one filter field, a new field each iteration |
| `GET /activitylog/types` | `get-activity-log-metadata.js` (all areas, no token or token generator credentials) |
| `GET /activitylog/filter/fields` | `get-activity-log-metadata.js` (all areas, no token or token generator credentials) |

## What is checked

Besides status 200 and a parseable body (the building blocks), the tests check the content with
[`domain-checks/access-management/enduser/activity-log.js`](../../../../domain-checks/access-management/enduser/activity-log.js)
and [`domain-checks/common/pagination.js`](../../../../domain-checks/common/pagination.js):

- **Log:** `data` is a list, every entry has `id`, `when` and a valid `type`, `subtype` and `trigger`,
  and every entry belongs to the organization on the side the direction asks for (`toId` with `To`,
  `fromId` with `From`). Where the test data guarantees entries (see below), the list must not be empty.
- **Filter values:** `data` is a list and every value has an `id`.
- **Filter fields:** each area offers exactly the fields it is expected to.
- **Types:** each area lists at least one type, each with an `id` and a valid `type`.

## Test data

The tests reuse the "be om tilgang" users in
[`testdata/access-management/enduser/request/<env>.csv`](../../../../../testdata/access-management/enduser/request/):
each row is an organization (`orgUuid`) and its daglig leder (`pid`, `partyUuid`), who reads the
organization's log with an `altinn:portal/enduser` token.

What their logs hold, from a scan of every user in yt01 (198) and at22 (197) in October 2026:

| Log | Has entries | Typical size |
| --- | --- | --- |
| `connections` `From` | all users | 10–40 entries |
| `connections` `To` | about 80% | 0–1 entries |
| `request` `To` | all users | 20–50 entries |
| `request` `From` | none | empty |
| `maskinporten` `To` and `From` | none | empty |

So `connections` `From` and `request` `To` are required to hold entries, and the maskinporten test
measures the empty answer. None of the logs spans more than one page, so the numbers are a best case;
organizations with long logs would give a more realistic picture.

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
k6 run --vus 10 --duration 5m K6/api/tests/access-management/enduser/activity-log/get-connections-activity-log.js

# breakpoint style: ramp up to 50 VUs over 10 minutes. BREAKPOINT_STAGE_TARGET must match the
# target, since setup() splits the users into that many slices; without it every VU but the first
# finds an empty slice and fails.
BREAKPOINT_STAGE_TARGET=50 k6 run --stage 10m:50 K6/api/tests/access-management/enduser/activity-log/get-request-activity-log-filter-values.js
```

`RANDOMIZE=false` walks the users in order instead of picking them at random. `TRACE_CALL=true` adds a
`traceparent` header so a slow request can be found in the service's logs.

## Known differences from the Swagger

- The Swagger calls the query parameters `Party`, `Direction`, etc. The client sends them in camelCase
  (`party`, `direction`), like the other enduser clients; the API accepts both.
- `direction` is marked optional, but without it `request` answers 400 and the other areas 403.
- The filter fields differ per area (`request` has no `Via`/`Role`, `maskinporten` has no
  `Via`/`Role`/`Package`), so the filter-value tests read them from `filter/fields` in `setup()`.
