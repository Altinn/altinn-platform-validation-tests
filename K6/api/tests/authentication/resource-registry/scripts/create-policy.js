import { ResourceRegistryApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { buildPolicy, getDefaultPolicyXml } from "./policy-builder.js";

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
              description: "Består av tilgangspakken",
              subjects: [
                  { id: "urn:altinn:accesspackage", value: "godkjenning-av-personell" },
              ],
              actions: ["read", "write"],
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

  const resourceName = "k6-test-innbygger-forsikring";

  const policy = getDefaultPolicyXml(resourceName); //buildPolicy(policyDefinition, resourceName);
  const policyResp = resourceRegistryApiClient.PostPolicy(resourceName, policy);

}
