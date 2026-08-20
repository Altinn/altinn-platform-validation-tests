# Swagger docs
https://docs.altinn.studio/nb/api/resourceregistry/spec/#/

# Setting up a resource and its policy

`ServiceResourceBuilder` and `XacmlPolicyBuilder` cover the two steps needed
before a resource can be authorized against. Neither builder fills anything in
for you: the payload that goes over the wire is the one the test spelled out,
so nothing surprising shows up in a request you are debugging.

```js
import {
    ResourceClient,
    ResourceType,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../clients/resource-registry/index.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
} from "../../building-blocks/resource-registry/resource/index.js";

const resourceClient = new ResourceClient(__ENV.BASE_URL, tokenGenerator);

const resource = new ServiceResourceBuilder("k6-test-resource")
    .withText("K6 test resource")
    .withResourceType(ResourceType.GenericAccessResource)
    .withCompetentAuthority("ttd")
    .withDelegable(false)
    .withVisible(false)
    .build();

ResourceCreateResource(resourceClient, resource);

const policyFile = new XacmlPolicyBuilder(resource.identifier)
    .withRule({ roles: ["DAGL"], actions: ["read", "write"] })
    .withMinimumAuthenticationLevel(3)
    .buildFile();

ResourceCreatePolicy(resourceClient, resource.identifier, policyFile);
```

`withText` is the one shortcut: it sets title, description and right description
to the same string in all three required languages. Pass a `{nb, nn, en}` object
to any of the three setters when they should differ.

What the registry validates, so a payload built here passes:

- The identifier must match `^[a-z0-9_-]{4,}$`.
- The resource type must be something other than `Default`.
- `ttd` is the only service owner that may leave the organization number out, so
  any other owner has to be set with `withCompetentAuthority(orgcode, orgnr)`.
- Title and description are required in nb, nn and en, and the right description
  in the same three when the resource is delegable.
- A `MaskinportenSchema` resource needs a resource reference of type
  `MaskinportenScope`.
- Writing to the registry needs the `altinn:resourceregistry/resource.write`
  scope, see `K6/scopes.js`.

`K6/api/tests/resource-registry/create-resource-and-policy.js` runs the whole
thing end to end and is the place to look for a worked example.
