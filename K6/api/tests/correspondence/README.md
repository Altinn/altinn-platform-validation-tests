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

## Validation scope

Every scenario requires 100% successful k6 checks and 0% failed HTTP
requests. The overview and content scenarios also require the selected
recipient to have at least one correspondence; an empty dataset is a failed
test rather than a successful no-op. Creation and read scenarios are separate
test runs and are not ordered, so recipients used by the read scenarios must
be seeded with correspondence data before those scenarios run.

The scenarios validate the immediate API contracts represented by the five
legacy performance scripts. They do not validate eventual publication,
notification or reminder delivery, malware-scan completion, attachment
download, or cleanup. The initialization payload intentionally omits
notification and reminder configuration to keep scheduled validation runs
free of those additional side effects. Add those as separate scenarios if
their behavior or performance needs to be measured.

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
and 100-VU breakpoint settings. Functional runs execute one iteration, while
smoke runs execute continuously with one VU for one minute. Creation and upload
profiles therefore generate persistent data, and breakpoint runs do so at high
volume. Start them only when that side effect is intended.
