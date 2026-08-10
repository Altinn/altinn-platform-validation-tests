# Access Management BFF

The clients here cover the Access Management BFF API, the API the Access
Management frontend talks to. It is served by the same host as the frontend, so
the base URL a client is constructed with is the host serving that frontend in
the environment, not the platform host.

Generated from the `Altinn.AccessManagement.UI` swagger document, one client
folder per swagger tag. The models are shared between the clients and live in
`common/common.types.js`, since most of them are used by more than one of them.
The three `Home` endpoints that serve the frontend itself are not covered, as
they return HTML and not JSON.

The swagger document leaves the response schema out for a fair number of
endpoints. Where that happens the building block still parses the body, but the
return type is `object` and the doc comment says the API publishes no schema.
Actions with an unspecified response, such as approving or rejecting a request,
return a boolean instead.
