# Service owner resource delegation

The functional test calls the service-owner API as Digdir and delegates the
dedicated resource `k6-serviceowner-resource-delegation` from a Tenor
organization to each recipient in the fixture. Digdir is the resource owner and
the only party authorized to perform the delegation. The `from` and `to` parties
are ordinary Tenor parties; they do not call the service-owner API themselves.

The resource is owned by Digdir (`991825827`), is hidden from the portal, and is
delegable. Its XACML policy grants `read` and `write` through the `jordbruk`
access package.

The resource has been provisioned in AT22, AT23, and TT02. The functional test
is registered only for AT22. Add later environments to `functional.yaml` after
the service-owner endpoints have been promoted and verified there.

## Client setup

`common.js` builds the client once per k6 runtime with `lazy`, for nobody in
particular. Which service owner an iteration acts as is decided by swapping the
token options:

```js
const { connections, tokenGenerator } = getClients();

tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));
```

`BaseTokenGenerator` keys its cache on the option set, so several service owners
cost one token each without the client being rebuilt. The options **replace**
the ones the generator was built with rather than adding to them, which is why
`getServiceOwnerTokenOpts` repeats the scopes.

## Test data

Two fixtures per environment, so service owners and recipients grow
independently:

```
K6/testdata/access-management/service-owner/connections/
  service-owners/<env>.csv   serviceOwnerOrg,serviceOwnerOrgNo,resource,fromOrganizationNumber
  recipients/<env>.csv       recipientType,recipientIdentifier
```

`fromOrganizationNumber` sits with the service owner rather than in its own file
because the delegating party has to be one the resource can be delegated from,
which ties it to the resource, not to the recipient list.

`recipientType` is `person` or `organization`, and decides which typed builder
method the request is built with:

```js
recipient.recipientType === "person"
    ? builder.WithToPerson(recipient.recipientIdentifier)
    : builder.WithToOrganization(recipient.recipientIdentifier);
```

Both fixtures are read over HTTP by `fetchTestData`, from
`raw.githubusercontent.com` pinned to `main` — not off disk. A fixture has to be
merged before a run can see it, so a new or renamed fixture answers 404 until
then. `TEST_DATA_BASE_URL` overrides the base path for a local file server or a
branch while a fixture is still in review.

## Party types the API accepts

From `ServiceOwnerConnectionPartyUrn` in the service-owner swagger, a party is
one of three forms, and anything else is rejected:

| Form | Builder method |
| --- | --- |
| `urn:altinn:organization:identifier-no:<orgnr>` | `WithToOrganization` / `WithFromOrganization` |
| `urn:altinn:person:identifier-no:<pid>` | `WithToPerson` / `WithFromPerson` |
| `urn:altinn:party:uuid:<uuid>` | `WithToPartyUuid` / `WithFromPartyUuid` |

The uuid form also accepts `urn:altinn:person:uuid`,
`urn:altinn:organization:uuid` and `urn:altinn:systemuser:uuid`. Those have no
dedicated method; pass the complete urn to `WithTo` or `WithFrom`.

## Teardown

Revoking runs in a real `teardown` step rather than at the end of the iteration,
so a run that fails partway through still cleans up after itself. Revoke removes
the complete resource delegation, so right keys are left off. Teardown sweeps
every service owner and recipient pair in the fixture; removing a delegation
that was never created is the normal case for a run that failed early.
