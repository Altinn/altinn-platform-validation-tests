# Authorized parties as service owner

Ported from the Bruno suite at
[ServiceOwnerAuthorizedParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/AuthorizedParties/ServiceOwnerAuthorizedParties).

Covers `POST /accessmanagement/api/v1/resourceowner/authorizedparties`. Each Bruno
scenario folder became one file here, and each numbered step inside it became one
`group()` carrying that step's BDD sentence, which is what shows up in the summary
output and in the Slack message.

Three things make this surface different from the enduser one, and the suite exists
partly to pin them down:

- The subject is named in the **request body**, so the caller and the subject are
  separate. The token only says which service owner is asking.
- The response is a **bare array** of parties, not the paginated envelope, so there is
  no `.data` to unwrap. Subunits are nested under their main unit.
- The party filter is **body based**, while `orgCode` and `anyOfResourceIds` are query
  parameters. A `partyFilter` query parameter is silently ignored here.

| Scenario | Covers |
| --- | --- |
| `01-clients-and-key-role-parties.js` | The bare array shape and the party field contract, the firm as a key role party, client organisations with the accountant packages, the sole proprietorship owner as a person, no duplicates |
| `02-access-information-flags.js` | The include flags populate the access collections without changing which parties come back |
| `03-key-role-filter.js` | Excluding key role parties drops what the subject only reaches through the firm |
| `04-party-filter.js` | Main unit, subunit and unreachable party filters |
| `05-resource-filter.js` | `anyOfResourceIds` narrows both the parties and the resources shown on them |
| `06-unit-hierarchy-delegation-directions.js` | All nine delegation directions, and that instance access is not inherited by subunits |
| `07-party-kinds.js` | Self identified user, ID-porten email user, rightholder with and without packages, system user |
| `08-authorization-boundaries.js` | No token, insufficient scope, resource owner scope, admin scope |
| `09-deleted-parties.js` | A deleted party keeps granting access to its owner for a retention window |
| `10-subject-lookup-forms.js` | The eight identifier forms resolve to the same party list |
| `11-org-code-filter.js` | Own org code allowed, another owner's refused, admin scope allowed either |
| `12-forretningsforer-clients.js` | A business manager's daily leader reaches the housing companies it manages |

`run-all.js` runs all twelve in order.

## Known gaps and deliberate choices

Two steps in `06` assert that the delegating party is **missing** from the receiving
side when the receiver is a subunit. That is wrong behaviour, tracked by
[#2952](https://github.com/Altinn/altinn-authorization-tmp/issues/2952). They assert it
anyway, with the issue named in the failure message, so they turn red when the fix
lands. In the Bruno folder this replaces those two directions were switched off behind
a flag and registered no assertions at all.

In `10`, both enterprise user lookup forms resolve to an empty list at at22, because the
fixture user holds no access. The pair is still compared, so a divergence between the
two forms would be caught the moment the fixture is given access, but as things stand
that equivalence is not exercised. It is not asserted non empty, because an empty
fixture is not a product failure.

`includeSubParties` is not covered: the filter is resolved but never applied, tracked by
[#3522](https://github.com/Altinn/altinn-authorization-tmp/issues/3522). The exact daglig
leder package count and the `includeAltinn2` / `includeAltinn3` parameters are not
asserted either, the first because the suite does not pin counts of catalogue wide sets
and the second because no controller binds them.

## Test data

`../testdata-<environment>.json` holds the accounting firm tree, the forretningsfører
firm, the enterprise and self identified users and the deleted sole proprietorships.
The main unit and subunit delegation hierarchy that `06` reads comes from
`../../enduser/testdata-<environment>.json`, which was ported from the same Bruno
fixture, and the service owner org codes come from `../../enduser/shared-testdata.json`.

The fixtures are fetched over HTTPS at `setup()` time rather than read off disk, so a
scheduled run does not need a checkout. That also means a fixture change only takes
effect once it is on `main`. To develop against fixtures that have not merged yet, point
`TESTDATA_REF` in `common.js` at the branch.

## Running

```
k6 run K6/api/tests/access-management/resource-owner/authorized-parties/run-all.js
```

`ENVIRONMENT` and `BASE_URL` are required, plus `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD`. `ENVIRONMENT` also picks the test data file, so it has to
match one of the `testdata-<environment>.json` files. Only at22 exists today, matching
the Bruno suite.
