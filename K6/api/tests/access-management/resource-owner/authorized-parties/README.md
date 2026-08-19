# Authorized parties as service owner

Ported from the Bruno suite at
[ServiceOwnerAuthorizedParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/AuthorizedParties/ServiceOwnerAuthorizedParties).

Covers `POST /accessmanagement/api/v1/resourceowner/authorizedparties`. Each Bruno
scenario folder became one file here.

A file is a **feature**. Each `scenario()` inside it is one scenario, and a scenario is one
action with the outcomes that followed from it, so it reads
`(GIVEN AND*)? WHEN THEN (AND)*` and never stacks two WHENs or two THENs. `scenario()`
takes the name, the setup and the single action as separate fields, so setup cannot drift
into the action and become a run on clause.

The outcomes are the checks inside the body. A domain check names itself, so it can be
called from any test without a sentence, and takes an optional trailing name that replaces
the default one. This suite passes its outcome sentence in there: the check owns the
comparison, the scenario owns the sentence. That is why the same check appears more than
once in a scenario saying different things, and why the first outcome reads THEN and the
rest read AND.

Rationale does not go in a step name. It goes in a comment next to the step.

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

## The GIVENs are pre seeded, and should not be

Every GIVEN in this suite describes state that already exists in at22. Nothing here creates
it, and neither did the Bruno collection this was ported from: the delegation directions
folder has no setup requests, only lookups. The parties are recorded in
`../../enduser/testdata-at22.json`. What was delegated between them is recorded nowhere, so
a reader cannot tell what `GIVEN main unit A has delegated access to main unit B` means
without querying at22.

Read out of at22 rather than out of any specification, the directions currently hold:

| Direction | Access packages | Resources | Instances |
| --- | --- | --- | --- |
| Main unit A to main unit B | `beredskap`, `damp-varmtvann`, `motta-nabo-og-planvarsel`, `patent-varemerke-design` | 2 migrated correspondence resources | 0 |
| Main unit A to person C | same four | `app_ttd_apps-test-prod` | 1 |
| Person A to main unit A | `innbygger-bank-finans`, `innbygger-forsikring`, `innbygger-frivillighet`, `innbygger-stotte-tilskudd`, `innbygger-vapen` | 2 `devtest_gar_bruno_accesslist` resources | 0 |
| Person A to person B | `innbygger-barn-foreldre`, `innbygger-helsetjenester`, `innbygger-pleie-omsorg`, `innbygger-samliv` | 2 | 1 |
| Subunit D to person A | `beredskap`, `byggesoknad`, `motta-nabo-og-planvarsel`, `patent-varemerke-design` | none | 1 |
| Subunit C to main unit B | `elektronisk-kommunikasjon`, `finansiering-og-forsikring`, `informasjon-og-kommunikasjon`, `kommuneoverlege`, `pleie-omsorgstjenester-i-institusjon` | `app_ttd_security-level3-app` | 0 |

None of it is asserted. The suite asserts the shape of the answer instead, that the
delegating party is present and that access inherits to subunits, because this suite does
not own those values and several of them look incidental rather than deliberate.

### Why the suite does not create its own setup

Considered and deliberately not done. The natural home would be k6's `setup()`, which runs
once before the iterations and already hands the fixtures to every scenario, paired with
`teardown()` to revoke what it created. The GIVENs would then describe something the suite
actually did, and could name the packages because the suite would have chosen them.

It is not worth it here. Creating a delegation from one organisation to another needs a
client this repo does not appear to have, and these parties are shared with the eight tests
in `../../enduser/authorized-parties/`, which assert delegated access between them. A suite
that creates or revokes delegations on shared parties can break that suite, and a failed
teardown leaves the environment dirty for everyone. The cost of doing it safely, seeding
parties of its own or agreeing ownership of these, is larger than the readability it buys.

So the GIVENs stay as descriptions of pre seeded state, and the table above stands in for
the setup a reader cannot see. Revisit it if a write client appears, or if these fixtures
stop being shared.

## Test data

`../testdata-<environment>.json` holds the accounting firm tree, the forretningsfører
firm, the enterprise and self identified users and the deleted sole proprietorships.
The main unit and subunit delegation hierarchy that
`unit-hierarchy-delegation-directions.js` reads comes from
`../../enduser/testdata-<environment>.json`, which was ported from the same Bruno
fixture, and the service owner org codes come from `../../enduser/shared-testdata.json`.

The fixtures are fetched over HTTPS at `setup()` time rather than read off disk, so a
scheduled run does not need a checkout. That also means a fixture change only takes effect
once it is on the ref `TESTDATA_REF` in `common.js` names.

**`TESTDATA_REF` currently points at this feature branch, not at `main`, so the suite can
be run by hand before its fixtures have merged. Set it back to `main` as part of merging.**
Left pointing at the branch, every scheduled run breaks the moment the branch is deleted.

## Running

```
k6 run K6/api/tests/access-management/resource-owner/authorized-parties/run-all.js
```

`ENVIRONMENT` and `BASE_URL` are required, plus `TOKEN_GENERATOR_USERNAME` and
`TOKEN_GENERATOR_PASSWORD`. `ENVIRONMENT` also picks the test data file, so it has to
match one of the `testdata-<environment>.json` files. Only at22 exists today, matching
the Bruno suite.
