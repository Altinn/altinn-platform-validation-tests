# Access Management

Tests for the Access Management APIs, split by audience the same way the
[docs](https://docs.altinn.studio/nb/api/accessmanagement/) are:

- `enduser` is what a logged in person or organization sees about their own access.
- `resource-owner` is what a service owner asks about somebody else's access.
- `metadata` is the read only catalogue of roles, packages and resources.
- `altinn-apps` is the instance delegation API used by apps.
- `consent` is the consent request, approval and lookup flow.

See the README in each subfolder for what the individual tests do.
