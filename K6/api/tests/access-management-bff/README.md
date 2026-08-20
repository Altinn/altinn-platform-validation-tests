# Access Management BFF

Tests against the BFF that the Access Management UI talks to. They are shaped like the calls a
browser makes when a page opens, so the labels are numbered steps rather than single endpoints,
and the timings say something about how the actual UI feels.

- `access-packages` delegates and revokes access packages.
- `client-admin` opens the client administration page.
- `consent` reads the consent log and active consents.
- `export` exports delegations.
- `instance-delegation` delegates an instance.
- `single-rights` delegates single rights.

All of them need `ENVIRONMENT` and `AM_UI_BASE_URL` (`BASE_URL` for `instance-delegation`), and
read a CSV per environment from `K6/testdata/access-management-bff/`. Data is segmented per VU
so two VUs never work on the same parties, and `RANDOMIZE` (default true) decides whether the
pick within a slice is random.
