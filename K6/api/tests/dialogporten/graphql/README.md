# Dialogporten, GraphQL API

- `get-dialogs-for-enduser.js` and `get-dialogs-for-enduser-serviceowner.js` get the dialogs of
  a random end user, the second one filtered to a random service owner.
- `get-dialogs-for-parties.js` fetches the parties of an end user and then the dialogs of all
  of them, capped by `MAX_NUMBER_OF_PARTIES` (default 100).
  `get-dialogs-for-parties-serviceowner.js` adds a service owner filter, and
  `get-dialogs-for-random-party.js` picks a single party instead.
- `get-parties.js` just fetches the parties of a random end user.
  `get-parties-worst-case.js` does it for users with a lot of parties, hardcoded per
  environment and labelled with the party count.
- `get-filter-service-resources.js` reads the service resource filter list.

Test data is `dialogporten/graphql/<env>/endusers.csv`. `get-parties.js` is not scheduled, it
is there for manual and performance runs. Needs `ENVIRONMENT` and `BASE_URL`.
