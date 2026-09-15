# Events smoke tests

Read-only smoke tests for the clients under `K6/clients/events/`, added for
issue #582. They prove the clients still build requests Events accepts; they
do not publish events or manage subscriptions.

- `get-subscriptions.js` lists ttd's subscriptions with `SubscriptionClient`.
- `get-app-events.js` asks `AppClient` for one event of the configured app.

Run every test in one go with `run-all.js`.

## Clients and methods not covered here

- `EventsClient.EventsGet` is left out on purpose. The client's `BASE_PATH` is
  `/events`, so the call goes to `<base>/events` and gets a 404 in every
  environment. Fix the path first (it is probably `/events/api/v1/events`),
  then add the call here.
- `AppClient.AppGetByParty` needs a party or person the service owner token
  can read events for. Add it once a test user for Events is agreed on; see
  #582.
- The create, validate and delete methods of `SubscriptionClient`, and the
  create methods of `AppClient` and `EventsClient`, write.

## Configuration

Defaults exist for `at23` and `tt02`. Override them for one run with:

- `EVENTS_ORG`, the service owner whose subscriptions and app events are read
  (default `ttd`).
- `EVENTS_APP`, the app whose events are read (default `secret`).

`ENVIRONMENT`, `BASE_URL`, `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD` come from the shared test runner, or from a `.conf`
file locally.
