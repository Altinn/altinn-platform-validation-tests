# Authorized parties as resource owner

One test per way a consumer asks for authorized parties, so the summary shows the cost of each
query variation separately. `-with-a2` means the Altinn 2 parties are included as well.

- `for-user.js` and `for-user-with-a2.js` ask for a person.
- `for-org.js` and `for-org-with-a2.js` ask for an organization.
- `for-system-user.js` and `for-system-user-with-a2.js` ask for a system user.
- `for-user-include-parties-via-key-role*.js` add `includePartiesViaKeyRoles`.
- `for-user-dialogporten.js` and `-with-filter.js` mirror the query Dialogporten makes, the
  second one with a party filter.
- `for-user-avgiver-liste.js` mirrors the avgiverliste query.

`for-user-many-parties/` runs the same endpoint against users with a lot of parties, up to tens
of thousands, one file per combination of `includeAltinn2`, `includeAccessPackages`,
`includePartiesViaKeyRoles`, resources and orgCode. The users and their approximate party count
live in `end-users.js`, and the label prefix keeps them in a stable order in the reports.

Test data is `access-management/resource-owner/get-authorized-parties/<env>.csv` plus the
per-test folders `for-system-user/<env>.csv` and `for-user-dialogporten-with-filter/<env>.csv`.
Needs `ENVIRONMENT` and `BASE_URL`.
