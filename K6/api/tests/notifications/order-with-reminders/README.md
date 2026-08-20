# Notification orders with reminders

Each test creates a notification order with a reminder attached, one per recipient type, and
checks that the order is accepted. The send time is set 120 days into the future so scheduled
runs do not actually send anything, and the sender references are prefixed `k6-` so the orders
are recognizable.

- `for-persons.js` addresses a person by national identity number.
- `for-orgs.js` addresses an organization by organization number.
- `for-email-addr.js` and `for-mobile-number.js` address an email address and a mobile number
  directly.

Needs `ENVIRONMENT`, `BASE_URL`, `resourceId`, and `ninRecipient` / `orgNoRecipient` depending
on the test. Runs create real orders.
