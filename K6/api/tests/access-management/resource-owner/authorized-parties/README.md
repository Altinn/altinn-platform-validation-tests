# Authorized parties as service owner

Ported from the Bruno suite at
[ServiceOwnerAuthorizedParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/AuthorizedParties/ServiceOwnerAuthorizedParties).

Covers `POST /accessmanagement/api/v1/resourceowner/authorizedparties`. Each Bruno
scenario folder became one file here.

The BDD reading lives in two places. A `group()` names the action, so it reads as the
GIVEN or the WHEN, and every check inside it names an outcome that was observed, so it
reads as a THEN or an AND. Both show up in the summary output and in the Slack message,
which is why the outcome sentence is passed in at the call site rather than baked into
the domain check: the check owns the comparison, the scenario owns the sentence. That is
also why the same check can appear twice in one group saying two different things.

The suite reports through `K6/bdd-summary.js` rather than the shared
`functional-tests-summary.js`. It keeps the GIVEN, WHEN, THEN and AND sentences and drops
the request plumbing while it passes, since three `GetAuthorizedParties - ...` lines per
request outnumber the outcomes they surround. Plumbing that *fails* is always shown,
labelled `[request]`, because a request that never succeeded is the reason every outcome
under it went red. The Slack message on a failed run carries only what did not hold.

Bruno's `NN_` prefixes are not carried over. They existed because Bruno orders steps by
`seq`; here the order is explicit in `run-all.js` and in source order within a file, and
the scenarios are independent of each other anyway.

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
| `clients-and-key-role-parties.js` | The bare array shape and the party field contract, the firm as a key role party, client organisations with the accountant packages, the sole proprietorship owner as a person, no duplicates |
| `access-information-flags.js` | The include flags populate the access collections without changing which parties come back |
| `key-role-filter.js` | Excluding key role parties drops what the subject only reaches through the firm |
| `party-filter.js` | Main unit, subunit and unreachable party filters |
| `resource-filter.js` | `anyOfResourceIds` narrows both the parties and the resources shown on them |
| `unit-hierarchy-delegation-directions.js` | All nine delegation directions, and that instance access is not inherited by subunits |
| `party-kinds.js` | Self identified user, ID-porten email user, rightholder with and without packages, system user |
| `authorization-boundaries.js` | No token, insufficient scope, resource owner scope, admin scope |
| `deleted-parties.js` | A deleted party keeps granting access to its owner for a retention window |
| `subject-lookup-forms.js` | The eight identifier forms resolve to the same party list |
| `org-code-filter.js` | Own org code allowed, another owner's refused, admin scope allowed either |
| `forretningsforer-clients.js` | A business manager's daily leader reaches the housing companies it manages |

`run-all.js` runs all twelve in order.

## Known gaps and deliberate choices

Two steps in `unit-hierarchy-delegation-directions.js` assert that the delegating party is **missing** from the receiving
side when the receiver is a subunit. That is wrong behaviour, tracked by
[#2952](https://github.com/Altinn/altinn-authorization-tmp/issues/2952). They assert it
anyway, with the issue named in the failure message, so they turn red when the fix
lands. In the Bruno folder this replaces those two directions were switched off behind
a flag and registered no assertions at all.

In `subject-lookup-forms.js`, both enterprise user lookup forms resolve to an empty list at at22, because the
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
The main unit and subunit delegation hierarchy that
`unit-hierarchy-delegation-directions.js` reads comes from
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
