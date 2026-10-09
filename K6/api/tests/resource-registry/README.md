# Resource Registry tests

Functional tests for the [Resource Registry](https://docs.altinn.studio/nb/api/resourceregistry/) clients under
[K6/clients/resource-registry](../../../clients/resource-registry). Every test reads content back and checks it.
A failed check shows up in Grafana like for every other test here; the steps the rest of a run depends on also end the
run with `fail()`, so one root cause is one failure.

## What is covered

| Test | Client | Methods | Environments |
| --- | --- | --- | --- |
| `access-list-enforcement.js` | `AccessListClient` (enterprise token), `AuthorizeClient` | `AccessListUpsert`, `AccessListUpsertResourceConnection`, `AccessListGetResourceConnections`, `AccessListAddMembers`, `AccessListGetByOwner` and `AccessListDelete` in teardown, `AuthorizePost` | at22; tt02 in CI, see below |
| `resource-v2-policy-rights.js` | `ResourceV2Client` | `ResourceV2GetPolicyRights` | at22, at23, tt02 |
| `get-orgs.js` | `ResourceOwnerClient` | `ResourceOwnerGetOrgs` | healthcheck, every environment |
| `get-updated-resources.js` | `ResourceClient` | `ResourceUpdated` | healthcheck, every environment |
| `create-resource-and-policy.js` | `ResourceClient` | resource and policy writes | on purpose only, see below |

`functional.yaml` runs the policy rights test in at22, at23 and tt02. `healthcheck.yaml` runs the two public reads
everywhere, including yt01 and prod. `run-all.js` runs the read-only tests once, for a local check after a change to
something shared.

### What the enforcement test checks

The resource owner creates an access list, connects a resource whose access lists the registry enforces, and adds
organization A. The policy decision point then permits A's daglig leder on behalf of A and denies B's daglig leder on
behalf of B. Both people hold the role the policy grants, so the list is the only thing that tells them apart. The
decision point answers 200 either way; Permit stands for the 200 and Deny for the 403 a service would give.

An organization alone is not a subject the policies grant anything to, so a decision about it is always
NotApplicable. That is why the test asks about the daglig leder.

The decision point caches its answers for a while, and an organization can still be permitted shortly after the list
it was on is deleted. The organizations are therefore split in two halves: A comes from the first and B from the
second, so B has never been on a list in any run.

Access lists are event-sourced in the registry, and every write stays in `resourceregistry.access_list_events` for
good, whatever teardown deletes. A run of this test costs four events: create, connect, add the member, delete.

### Not covered, and why

- `AccessListClient.AccessListPatch`: the registry has the endpoint but does not implement it. `UpdateAccessList`
  throws `NotImplementedException`, answers 501, and its remarks say to use PUT
  ([Altinn/altinn-resource-registry#879](https://github.com/Altinn/altinn-resource-registry/issues/879)). The
  client method sends `application/json-patch+json`, which is what the endpoint consumes, so it is ready for the day
  it is implemented.
- `create-resource-and-policy.js` is not in `run-all.js` or any yaml. Deleting a resource leaves rows in
  `resourceregistry.resourcesubjects` behind, reported as
  [Altinn/altinn-resource-registry#848](https://github.com/Altinn/altinn-resource-registry/issues/848), so every run
  leaks. Start it by hand when needed.
- yt01 and prod are out for the access list tests: they write, and the token generator does not issue for prod.
- at23 is out for the enforcement test: there are no organizations with a daglig leder for at23 in the
  authorization test data.

## Tokens

- `AccessListClient` takes an enterprise token for the owner org with `altinn:resourceregistry/accesslist.read` and
  `accesslist.write`. The registry checks the token's org against the owner in the path, so the tests can only touch
  the lists of the configured owner.
- `AuthorizeClient` is the shared one from `../authorization/authorize-client.js`: a personal token with the
  authorize admin scope, and the `AUTHORIZATION_SUBSCRIPTION_KEY` the decision point sits behind.
- `ResourceV2Client` takes no token; policy rights are public.

## Resources

Two files of resources, one row per resource, read in `setup`. Each iteration picks one row with `getItemFromList`.

- `K6/testdata/resource-registry/resources-<env>.csv`: resources with access lists disabled. The v2 policy rights
  test reads these.
- `K6/testdata/resource-registry/access-list-enforced-resources-<env>.csv`: resources with access lists enabled. The
  enforcement test reads these.

| Column | What it is |
| --- | --- |
| `owner` | Org code that owns the resource and the lists the tests create; the enterprise token is issued for it. |
| `ownerOrgNo` | Organization number in the enterprise token. |
| `resourceId` | The resource. It has to be owned by `owner` and exist in the environment. |
| `actions` | The actions its policy grants, separated by `;`. The enforcement test asks about the first; the v2 policy rights test checks the decomposed policy against all of them. |

Besides the files, the tests need `BASE_URL`, `ENVIRONMENT`, `TOKEN_GENERATOR_USERNAME` and `TOKEN_GENERATOR_PASSWORD`,
and the enforcement test also `AUTHORIZATION_SUBSCRIPTION_KEY`.

## Test data

The enforcement test reads organizations with their daglig leder from
`K6/testdata/authorization/pdp-authorize/orgs-dagl-<env>.csv`, with the columns `orgno,ssn`. How the resource files
are made is described in [K6/testdata/resource-registry/README.md](../../../testdata/resource-registry/README.md).

The files are read from `main` over HTTP, so a change to them takes effect when it is merged. To run a test locally
against data on another branch, set `TESTDATA_BRANCH=<branch>`.

## Running locally

```powershell
. .\.conf\at22.ps1
k6 run K6/api/tests/resource-registry/run-all.js
k6 run K6/api/tests/resource-registry/access-list-enforcement.js
```

Every list a test creates has an identifier of the form `k6-<run id>-<uuid>`, where the run id comes from `setup`.
Teardown deletes the owner's lists with this run's id, so a run that failed halfway leaves nothing behind, and a
scheduled run that overlaps with a manual or PR run does not delete a list the other is still using. It also deletes
any `k6-` list older than an hour, which is a leftover from a run whose teardown never ran. After a run,
`AccessListGetByOwner(ttd)` holds no `k6-` lists.

## Adding a test to this folder

1. Put the client factory and any shared helper in `commons.js`; build clients and token generators with `lazy`
   so a VU builds them once, and set the token generator options per call when the token depends on the row, as
   `getAccessListClient(owner, ownerOrgNo)` does. The generator caches one token per set of options. Read test data
   in `setup` and pass it on through the data object; nothing should read a file per iteration.
2. Use the building blocks under [K6/api/building-blocks/resource-registry](../../building-blocks/resource-registry).
   The versioned ones (get, get members, upsert, upsert resource connection, delete) return `{ value, etag, status }`
   and take an `options` argument with conditional `headers` and an `expectedStatus`, so a call that should answer
   304, 404 or 412 is still a building block call and does not count as a failed request in the metrics
   (`withExpectedStatus` in `building-blocks/common/retry.js`). The rest return the body, as every other building
   block does.
3. Check content with the domain checks under
   [K6/api/domain-checks/resource-registry](../../domain-checks/resource-registry); add a check there rather than an
   inline `check` when the assertion says something about the domain.
4. Draw a run id with `newRunId()` in `setup`, create lists with `newIdentifier(data.runId)`, and end with a
   `teardown(data)` that calls `deleteTestListsOf(data.resources, data.runId)`.
5. Wire the test into `run-all.js` and `functional.yaml`, and add a row to the table above.
