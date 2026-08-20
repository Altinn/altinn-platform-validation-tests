# Apps instance delegation

`instance-delegation-check.js` acts as an Altinn app delegating rights on one of its own
instances. It reads the existing delegations, checks which rights are delegable, and asserts
that the API rejects an empty PlatformAccessToken and hands another app an empty answer
instead of somebody else's delegations.

The API works out who is delegating from the issuer and app claim in the PlatformAccessToken,
so the org and app in `commons.js` have to match the resource in the path. The app and the
instance they run against are hardcoded there.

Needs `ENVIRONMENT` and `BASE_URL`.
