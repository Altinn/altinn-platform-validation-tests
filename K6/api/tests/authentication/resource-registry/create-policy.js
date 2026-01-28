import { PostResource, PostPolicy } from "../../../building-blocks/authentication/resource-registry/index.js";
import { ResourceRegistryApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

let resourceRegistryApiClient = undefined;

export default function () {
    if (resourceRegistryApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:resourceregistry/resource.write altinn:resourceregistryresource.read altinn:resourceregistry/resource.admin");
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL, tokenGenerator);
    }

    const policyDefinition = {
      rules: [
          {
              effect: "Permit",
              description: "Copy of policy created by Vegard via GUI",
              subjects: [
                  { id: "urn:altinn:rolecode", value: "dagl" },
                  { id: "urn:altinn:rolecode", value: "bobes" },
                  { id: "urn:altinn:rolecode", value: "PRIV" },
                  { id: "urn:altinn:rolecode", value: "SELN" },
                  { id: "urn:altinn:accesspackage", value: "byggesoknad" },
              ],
              actions: ["read", "confirm", "delete"],
          },
      ],
      obligationExpressions: [
          {
              obligationId: "urn:altinn:obligation:authenticationLevel1",
              fulfillOn: "Permit",
              attributeId: "urn:altinn:obligation1-assignment1",
              category: "urn:altinn:minimum-authenticationlevel",
              value: 3,
          },{
              obligationId: "urn:altinn:obligation:authenticationLevel2",
              fulfillOn: "Permit",
              attributeId: "urn:altinn:obligation2-assignment2",
              category: "urn:altinn:minimum-authenticationlevel-org",
              value: 3,
          },
      ],
};

    const policyResp = PostPolicy(resourceRegistryApiClient, "k6-generated-resource-01", policyDefinition);

}
