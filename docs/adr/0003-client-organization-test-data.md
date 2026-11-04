# ADR 0003: Client organization test data for functional tests

Status: Draft
Date: 2026-11-04

## Context

Client delegation is hard to test without the right data. A test needs an organization that has clients, such as an auditor, an accountant or a business manager, and a person who can log in on its behalf. Until now, tests have set up client relations themselves (`setUpClientRelation` in `client-delegations-v2`). That gives the client a resource right, but not the roles from Enhetsregisteret or the access packages that a real accountant or auditor has, so large parts of the client flows could not be tested.

## Decision

The files in [K6/testdata/access-management/enduser/client-organizations](../../K6/testdata/access-management/enduser/client-organizations) are shared test data for functional tests of client delegation in at22, at23 and tt02. K6 tests, Playwright tests and exploratory testing can all use them.

- `<environment>.csv` has one row per organization with clients, one per profile: `revisor`, `regnskapsforer`, `forretningsforer`, `revisor-jordbruk` (auditor clients, some with agriculture packages) and `egendefinert` (custom clients with 1-3 access packages). Each row has the person who logs in (`pid`, `userId`, `partyId`, `partyUuid`), the organization to act for (`orgNo`, `orgPartyId`, `orgUuid`) and the number of clients.
- `<profile>/<environment>.csv` has a selection of that organization's clients: one client for each combination of client type, roles, Enhetsregisteret role plus custom relation (`hasErRoleAndCustom`) and access packages. Each row has the organization it belongs to (`orgNo`) and the client (`clientOrgNo`, `clientName`, `clientType`). The full lists are too large to keep here (the two auditors have around 5,500 and 6,000 clients each), and a test that needs the full volume logs in as the organization instead. `clientCount` has the real number.

All persons and organizations are synthetic Tenor data. The IDs are specific to each environment.

Tests may change delegations for these users, for example by giving an agent access to a client and removing it again. Since several tests share the data, a test should not depend on an exact number of delegations to agents; the client relations themselves come from the data set and are stable.

The data is not for performance tests or yt01, and has no prod equivalent.

## Consequences

Client flows can be tested functionally with realistic volumes, from 10 to almost 6,000 clients, without each test building its own relations. The data has to be regenerated if the environments are reset or the client relations change, and the IDs must then be looked up again for each environment.
