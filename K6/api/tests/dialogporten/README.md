# Dialogporten

Split by the API the caller uses: `enduser` and `serviceowner` are the REST APIs, `graphql` is
the GraphQL API the frontend uses. Most tests pick a random end user from
`dialogporten/*/<env>/endusers.csv` and read whatever that user happens to have, so they work
in every environment without seeded data.
