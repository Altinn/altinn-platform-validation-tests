/*
* Example script to create a policy in the Resource Registry for testing purposes.
* No resource is created in this script, it is assumed that the resource already exists.
* A predefined policy XML is used for the creation, but can be modified as needed.
* See policy-builder.js for building custom policies.
* Run: k6 run create-policy.js
* Set environment variables:
*   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
*   BASE_URL - the base URL of the Resource Registry API
* Example:
*   ENVIRONMENT=yt01 BASE_URL=https://platform.at22.altinn.cloud k6 run create-policy.js
* TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must also be set in the environment for token generation
*/
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

  const resourceName = "k6-test-innbygger-forsikring";

  const policy = getDefaultPolicyXml(resourceName); //buildPolicy(policyDefinition, resourceName);
  const policyResp = resourceRegistryApiClient.PostPolicy(resourceName, policy);

}
