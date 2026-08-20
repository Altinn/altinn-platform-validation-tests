# Swagger docs
https://docs.altinn.studio/nb/api/resourceregistry/spec/#/

# Setting up a resource and its policy

`ServiceResourceBuilder` and `XacmlPolicyBuilder` cover the two steps needed
before a resource can be authorized against. The defaults satisfy the registry
validation on their own, so a test only spells out what it actually cares about.

```js
import {
    ResourceClient,
    ServiceResourceBuilder,
    XacmlPolicyBuilder,
} from "../../../../clients/resource-registry/index.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
} from "../../../building-blocks/resource-registry/resource/index.js";

const resourceClient = new ResourceClient(__ENV.BASE_URL, tokenGenerator);

const resource = new ServiceResourceBuilder("k6-test-resource")
    .withText("K6 test resource")
    .build();

ResourceCreateResource(resourceClient, resource);

const policyFile = new XacmlPolicyBuilder(resource.identifier)
    .withRule({ roles: ["DAGL"], actions: ["read", "write"] })
    .buildFile();

ResourceCreatePolicy(resourceClient, resource.identifier, policyFile);
```

Notes worth knowing before changing the defaults:

- The identifier must match `^[a-z0-9_-]{4,}$`.
- `ttd` is the only service owner that may leave the organization number out, so
  any other owner has to be set with `withCompetentAuthority(orgcode, orgnr)`.
- Title, description and right description are required in nb, nn and en, and
  the right description only when the resource is delegable.
- A `MaskinportenSchema` resource needs a resource reference of type
  `MaskinportenScope`.
- Writing to the registry needs the `altinn:resourceregistry/resource.write`
  scope, see `K6/scopes.js`.
