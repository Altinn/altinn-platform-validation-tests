# Correspondence validation and performance tests

These tests migrate the five scenarios from
`Altinn.Correspondence.LoadTests/correspondence` into the shared validation
test repository:

- `initialize-correspondence.js` initializes a correspondence with JSON.
- `create-and-upload-correspondence.js` initializes a correspondence with a
  50 KiB attachment and an enterprise service-owner token.
- `create-and-upload-correspondence-single-user.js` runs the same upload for
  one fixed recipient with a personal representative token.
- `get-correspondence-overview.js` lists correspondences and retrieves their
  overviews.
- `get-correspondence.js` resolves the matching Dialogporten token for each
  correspondence and retrieves its content.

The tests use the shared Dialogporten end-user CSV for the active environment.
Creation tests set `ignoreReservation=true` by default so synthetic people who
are reserved in KRR do not turn a performance run into an expected 422 result.
The list endpoint is unpaginated, so detail and content follow-up calls are
capped at 20 per iteration by default.

## Configuration

The defaults support `at23`, `tt02`, and `yt01`. They can be overridden with:

- `CORRESPONDENCE_RESOURCE_ID`
- `CORRESPONDENCE_RECIPIENT`
- `CORRESPONDENCE_SENDER_ORG`
- `CORRESPONDENCE_SENDER_ORG_NO`
- `CORRESPONDENCE_SENDER_PID`
- `CORRESPONDENCE_IGNORE_RESERVATION`
- `CORRESPONDENCE_ATTACHMENT_SIZE_BYTES`
- `CORRESPONDENCE_MAX_ITEMS_PER_ITERATION`

`ENVIRONMENT`, `BASE_URL`, `TOKEN_GENERATOR_USERNAME`, and
`TOKEN_GENERATOR_PASSWORD` are supplied by the shared test runner. A live run
creates persistent correspondences and attachments in the selected test
environment.

## Test profiles

`smoke.yaml` and `functional.yaml` cover all five scenarios in all supported
environments. `breakpoint.yaml` runs them in `yt01` with the standard ten-minute
and 100-VU breakpoint settings.
