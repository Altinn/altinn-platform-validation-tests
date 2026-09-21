# Resource Registry tests

Functional tests for the [Resource Registry](https://docs.altinn.studio/nb/api/resourceregistry/) clients under
[K6/clients/resource-registry](../../../clients/resource-registry). Every test reads content back and checks it,
and runs with [`getStrictOptions`](../../../helpers.js), so a failed check or a failed request fails the run.

## What is covered

| Test | Client | Methods | Environments |
| --- | --- | --- | --- |
| `access-list-lifecycle.js` | `AccessListClient` | `AccessListUpsert` (create and update), `AccessListGet`, `AccessListGetByOwner` (plain and with `include=resource-actions`), `AccessListAddMembers`, `AccessListGetMembers`, `AccessListReplaceMembers`, `AccessListRemoveMembers`, `AccessListUpsertResourceConnection`, `AccessListGetResourceConnections`, `AccessListDeleteResourceConnection`, `AccessListDelete` | at22, at23, tt02 |
| `access-list-etag.js` | `AccessListClient` | `AccessListGet` and `AccessListGetMembers` with `If-None-Match` (304), `AccessListUpsertResourceConnection` and `AccessListDelete` with a stale (412) and the current (200) `If-Match` | at22, at23, tt02 |
| `access-list-memberships.js` | `AccessListMembershipsClient`, `AccessListClient` (platform token) | `AccessListMembershipsGetMemberships`, `AccessListGetByMember` | at22, at23, tt02 |
| `resource-v2-policy-rights.js` | `ResourceV2Client` | `ResourceV2GetPolicyRights` | at22, at23, tt02 |
| `get-orgs.js` | `ResourceOwnerClient` | `ResourceOwnerGetOrgs` | healthcheck, every environment |
| `get-updated-resources.js` | `ResourceClient` | `ResourceUpdated` | healthcheck, every environment |
| `create-resource-and-policy.js` | `ResourceClient` | resource and policy writes | on purpose only, see below |

`functional.yaml` runs the first four in at22, at23 and tt02. `healthcheck.yaml` runs the two public reads everywhere,
including yt01 and prod. `run-all.js` runs everything except `create-resource-and-policy.js` once, for a local check
after a change to something shared.

### Not covered, and why

- `AccessListClient.AccessListPatch`: the registry has the endpoint but does not implement it. `UpdateAccessList`
  throws `NotImplementedException`, answers 501, and its remarks say to use PUT
  ([Altinn/altinn-resource-registry#879](https://github.com/Altinn/altinn-resource-registry/issues/879)). The
  lifecycle test updates through `AccessListUpsert` instead. The client method sends `application/json-patch+json`,
  which is what the endpoint consumes, so it is ready for the day it is implemented.
- `ResourceV2GetPolicyRights` is declared in the swagger as `ResourceDecomposedDto` (`{ "rights": [...] }`) but the
  registry returns the `RightDto` list directly
  ([Altinn/altinn-resource-registry#878](https://github.com/Altinn/altinn-resource-registry/issues/878)). The
  building block returns what is on the wire; switch it back to the generated type once the registry and its swagger
  agree.
- `create-resource-and-policy.js` is not in `run-all.js` or any yaml. Deleting a resource leaves rows in
  `resourceregistry.resourcesubjects` behind, reported as
  [Altinn/altinn-resource-registry#848](https://github.com/Altinn/altinn-resource-registry/issues/848), so every run
  leaks. Start it by hand when needed.
- yt01 and prod are out for the access list tests: they write, and the token generator does not issue for prod.

## Tokens

- `AccessListClient` takes an enterprise token for the owner org with `altinn:resourceregistry/accesslist.read` and
  `accesslist.write` for everything but `get-by-member`. The registry checks the token's org against the owner in the
  path, so the tests can only touch the lists of the configured owner.
- `get-by-member` and `memberships` are reserved for platform components and take a platform access token issued
  for the `platform` org, sent in the `PlatformAccessToken` header. The registry answers 401 to a bearer token there,
  whatever scopes it carries. `memberships` has its own client, `AccessListMembershipsClient`. `get-by-member` sits in
  `AccessListClient` because the swagger has it under the Access List tag, so the tests build a second
  `AccessListClient` on the platform token generator for that one call (`getAccessListPlatformClient` in `commons.js`),
  the way the register tests keep one `RegisterClient` per token flavour.
- `ResourceV2Client` takes no token; policy rights are public.

## Configuration

`commons.js` holds the defaults per environment and the env var that overrides each of them for an ad-hoc run. A
run against an environment without defaults has to set all three.

| Key | Env var | Default (at22, at23, tt02) | What it is |
| --- | --- | --- | --- |
| `owner` | `RESOURCE_REGISTRY_OWNER` | `ttd` | Org code that owns the lists the tests create, and the org of the enterprise token. |
| `ownerOrgNo` | `RESOURCE_REGISTRY_OWNER_ORG_NO` | `991825827` | Organization number in the enterprise token. |
| `resourceId` | `RESOURCE_REGISTRY_RESOURCE_ID` | `k6-instancedelegation-test` | Resource the tests connect their lists to. Owned by `owner`, present in all three environments, access lists disabled so a connection grants nobody anything, and a policy with six actions the v2 test reads back. |

Besides these, the tests need `BASE_URL`, `ENVIRONMENT`, `TOKEN_GENERATOR_USERNAME` and `TOKEN_GENERATOR_PASSWORD`.

## Test data

The members are synthetic businesses from Tenor, enriched with their Altinn party from Register, in
`K6/testdata/resource-registry/businesses-<env>.csv` with the columns `orgNo,partyId,partyUuid,orgForm`. The
lifecycle test adds two `AS` and one `ENK`; the memberships test one `ENK`. How to regenerate the files is described in
[K6/testdata/resource-registry/README.md](../../../testdata/resource-registry/README.md).

The files are read from `main` over HTTP, so a change to them takes effect when it is merged. To run a test locally
against data on another branch, set `TESTDATA_BRANCH=<branch>`.

## Running locally

```powershell
. .\.conf\at23.ps1
k6 run K6/api/tests/resource-registry/run-all.js
k6 run K6/api/tests/resource-registry/access-list-lifecycle.js
```

Every list a test creates has an identifier starting with `k6-`, and every teardown deletes the owner's `k6-` lists,
so a run that failed halfway leaves nothing behind. After a run, `AccessListGetByOwner(ttd)` holds no `k6-` lists.

## Adding a test to this family

1. Put the client factory and any shared helper in `commons.js`; build clients with `lazy` so a VU builds them once.
2. Use the building blocks under [K6/api/building-blocks/resource-registry](../../building-blocks/resource-registry)
   for the calls that should answer 200. For a call that should answer something else (a 404 after a delete, a 412 on
   a stale ETag), call the client directly inside `expectingStatus(status, () => ...)` and check the status with
   `AccessListDomainChecks.CheckStatus`, so the strict thresholds do not count it as a failed request.
3. Check content with the domain checks under
   [K6/api/domain-checks/resource-registry](../../domain-checks/resource-registry); add a check there rather than an
   inline `check` when the assertion says something about the domain.
4. Create lists with `newIdentifier()` and end with a `teardown` that calls `deleteTestLists()`.
5. Wire the test into `run-all.js` and `functional.yaml`, and add a row to the table above.
