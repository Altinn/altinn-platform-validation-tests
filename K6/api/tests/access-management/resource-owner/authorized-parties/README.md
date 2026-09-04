# Authorized parties as service owner

Ported from the Bruno suite at
[ServiceOwnerAuthorizedParties](https://github.com/Altinn/altinn-authorization-tmp/tree/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/AuthorizedParties/ServiceOwnerAuthorizedParties).

Covers `POST /accessmanagement/api/v1/resourceowner/authorizedparties`. Each Bruno
scenario folder became one file here.

Each file is one outer `group()` naming what it covers, with an inner `group()` per lookup,
following the nested group shape used by
`../../altinn-apps/instance-delegation-check.js`. The assertions are domain checks, which
name themselves from their arguments, so a check called twice in one group still produces
two distinct lines rather than collapsing into one count.

Reporting goes through the shared `handleSummary` in `common-imports.js`, like every other
functional suite.

Bruno's `NN_` prefixes are not carried over. They existed because Bruno orders steps by
`seq`; here the order is explicit in `run-all.js` and in source order within a file, and
the groups are independent of each other anyway.

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
| `subject-lookup-forms.js` | The six identifier forms resolve to the same party list |
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

`subject-lookup-forms.js` no longer covers the two enterprise user forms. They resolved to an
empty list at at22, because the fixture user held no access, so the pair agreed on nothing and
the equivalence was never exercised. They were dropped when the scenario moved to a csv rather
than kept against a fixture only at22 has: an enterprise user is not something Register hands
out, so there was no way to generate one per environment. Whoever wants them back has to seed
an enterprise user with access first, which is what would make the steps worth having.

`includeSubParties` is not covered: the filter is resolved but never applied, tracked by
[#3522](https://github.com/Altinn/altinn-authorization-tmp/issues/3522). The exact daglig
leder package count and the `includeAltinn2` / `includeAltinn3` parameters are not
asserted either, the first because the suite does not pin counts of catalogue wide sets
and the second because no controller binds them.

## The delegations are pre seeded, and should not be

Every delegation this suite reads already exists in at22. Nothing here creates it, and neither did the Bruno collection this was ported from: the delegation directions
folder has no setup requests, only lookups. The parties are recorded in
`../../enduser/testdata-at22.json`. What was delegated between them is recorded nowhere, so
a reader cannot tell what "main unit A has delegated access to main unit B" means without
querying at22.

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
`teardown()` to revoke what it created. The setup would then be something the suite
actually did, and could name the packages because the suite would have chosen them.

It is not worth it here. Creating a delegation from one organisation to another needs a
client this repo does not appear to have, and these parties are shared with the eight tests
in `../../enduser/authorized-parties/`, which assert delegated access between them. A suite
that creates or revokes delegations on shared parties can break that suite, and a failed
teardown leaves the environment dirty for everyone. The cost of doing it safely, seeding
parties of its own or agreeing ownership of these, is larger than the readability it buys.

So the delegations stay pre seeded, and the table above stands in for the setup a reader
cannot see. Revisit it if a write client appears, or if these fixtures
stop being shared.

## Test data

Eight of the twelve scenarios read a generated csv, ten rows per environment, in at22,
at23, tt02 and yt01. Four still read the hand described json fixture and still run at at22
alone. The split is not about file format: it follows what a scenario can find in the
wild.

A scenario can be generated when what it asserts is a shape the endpoint itself will tell
you about. Which client carries the accountant packages, which subunit hangs under it,
which party is the sole proprietorship owner, which parties drop out when key roles are
excluded, which resource narrows the list, which six identifier forms name one subject:
none of that is written down anywhere, and all of it is readable off a lookup. The
generators start from organisations the register suite already carries, ask Register who
leads them, and then let the endpoint under test decide which candidates survive. Nothing
is seeded, so a row is only as durable as the daglig leder role behind it, and the answer
is regenerate rather than repair.

A scenario cannot be generated when what it asserts was put there on purpose. The four
below are in that group, and the section after this one says what each would need.

| Generator | Writes the rows for |
| --- | --- |
| `testdataGeneration/subject-lookup-forms-data.js` | `subject-lookup-forms` |
| `testdataGeneration/accounting-firm-data.js` | `clients-and-key-role-parties`, `access-information-flags`, `key-role-filter`, `party-filter`, `resource-filter` |
| `testdataGeneration/subject-only-data.js` | `authorization-boundaries`, `org-code-filter` |

The five accounting firm scenarios share one generator because they share one lookup: an
accounting firm's daglig leder and the parties it answers with. Five generators would mean
five copies of that pass and five times the traffic for the same parties.

### Where the candidates come from, and why that is a weakness

Every generator starts from `register/organizations-<environment>.csv`, thirty
organisations that already existed in the repo, chosen for the register suite rather than
for this one. Each is tried in turn and kept only if the endpoint answers with everything
the scenario needs. That is generate and test over an inherited list, not a search: nothing
here asks for an accounting firm, it asks thirty organisations whether they happen to be
one.

It works, and the rows it produces are real. What it costs is reach. Ten rows out of at
most twenty eight candidates is a sample of that file rather than of the environment, and
any conclusion drawn from a candidate coming up empty, such as the business manager one
above, holds only for those thirty.

The tool for doing this properly is Tenor, whose KQL search over the synthetic
Enhets- og Foretaksregister can ask for facilitators by role directly, daglig leder and
clients included, in `playwright/tenor` in the access management frontend repo. Sourcing the
candidates from a Tenor query rather than from this file would turn the filter into a query
and lift the ceiling on how many rows an environment can fill. It has not been done.

Each generator prints its csv, which is copied into
`K6/testdata/access-management/resource-owner/authorized-parties/<scenario>/<environment>.csv`
by hand, since a k6 run cannot write back to the repo. The files hold ten rows apart from
the resource filter, which holds whatever the environment could fill: ten at yt01, three at
tt02, one at at22 and at23. Nobody has delegated a resource to these firms in the AT
environments, and a firm picked out of Enhetsregisteret holds none on its own.

### What the four remaining scenarios would need

`forretningsforer-clients.js` was tried and put back. Among the candidates the generators
draw from, the organisations carrying the `forretningsforer` role carry only accountant
packages: no business manager package appears anywhere in the response. Rows could still be
produced that pass, naming an accountant package as the one the firm holds on its client,
but the scenario would no longer be about business managers.

That is a statement about thirty organisations, not about the environment. The candidates
are `register/organizations-<environment>.csv`, a file picked for the register suite, so a
housing company client with a package held through that role may well exist outside it. See
the note on sourcing below before concluding it has to be seeded.

`party-kinds.js` needs a self identified user, an ID-porten user registered by email, a
rightholder holding packages and one holding none, and a system user. Register hands out
none of those, and the two rightholder cases only exist because a delegation was made.

`deleted-parties.js` needs two sole proprietorships deleted on either side of a two year
retention window, both with an owner, plus an active one. Register carries `isDeleted` and
`deletedAt`, so the deletion dates are readable, but two things are not. Register serves
holders for `daglig-leder` and no other role, so the owner of a sole proprietorship cannot
be looked up, and the party deleted outside the window is absent from the response by
definition, which is the whole assertion. Discovery has nothing to read either side from.

`unit-hierarchy-delegation-directions.js` needs a hierarchy carrying delegations in all
nine directions between main units, subunits and people. Finding one of those in the wild
is unlikely and finding ten is not worth trying.

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
`TOKEN_GENERATOR_PASSWORD`. `run-all.js` runs at at22 only, because the four scenarios
that still read the json fixture have one only for at22.

The eight csv driven scenarios run on their own in at22, at23, tt02 and yt01:

```
k6 run K6/api/tests/access-management/resource-owner/authorized-parties/subject-lookup-forms.js
```

Each draws one of its ten rows per iteration, at random unless `RANDOMIZE=false`, which
picks by iteration number instead, so ten iterations exercise every row. Regenerating the
rows additionally needs `REGISTER_SUBSCRIPTION_KEY`:

```
k6 run K6/api/tests/access-management/resource-owner/authorized-parties/testdataGeneration/accounting-firm-data.js
```
