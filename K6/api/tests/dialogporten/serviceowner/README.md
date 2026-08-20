# Dialogporten, service owner API

Writes:

- `create-dialog-enduser.js` and `create-dialog-org.js` create a dialog for a person and for an
  organization.
- `create-dialog-transmission-activity.js` creates a dialog and then a transmission and an
  activity on it.

Reads, one file per query variation so each filter is measured on its own:

- `get-dialogs-party*.js` filters by party, with and without `createdAfter` / `createdBefore`.
- `get-dialogs-enduser-serviceresource*.js` filters by end user and service resource, with the
  same date variations plus free text search. `-search-nohit.js` searches for words that are
  known not to match, which is the expensive case.
- `get-dialogs-and-extract-details.js` drills from the dialog list down into activities,
  transmissions and seen logs.
- `get-endusercontext.js` reads the end user context, and `get-endusercontext-worstcase.js`
  does it for users with 2k to 73k parties, hardcoded and labelled with the count.
- `should-send-notification.js` checks the notification decision for known dialogs with
  transmissions, from
  `dialogporten/serviceowner/should-send-notification/dialogs-with-transmissions-<env>.csv`.

Test data is `dialogporten/serviceowner/<env>/endusers.csv`. Needs `ENVIRONMENT` and
`BASE_URL`. The create tests leave real dialogs behind.
