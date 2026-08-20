# Dialogporten, end user API

- `get-dialogs-for-enduser.js` gets all dialogs for a randomly picked end user.
- `get-dialogs-and-extract-details.js` goes one level deeper: it picks a random dialog and then
  a random activity, transmission and seen log, and fetches each of them. The steps are labelled
  1 to 8 so the summary shows where the time goes.

Test data is `dialogporten/endusers/<env>/endusers.csv`. Needs `ENVIRONMENT` and `BASE_URL`.
