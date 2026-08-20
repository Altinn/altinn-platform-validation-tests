# Sanity checks

Checks the test rig itself rather than any Altinn API. `token-generators.js` asks each of the
three token generators for a token and checks that it comes back, so a wall of failing tests
can be told apart from expired credentials. The timings are collected under the
`token_generator` tag, since the generators tag their own requests.

Needs `ENVIRONMENT`, `TOKEN_GENERATOR_USERNAME`, `TOKEN_GENERATOR_PASSWORD`,
`MASKINPORTEN_KID`, `MASKINPORTEN_CLIENT_ID` and `MASKINPORTEN_CLIENT_PEM`.
