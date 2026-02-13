/*
 *   Example script to create a resource
 *   Run: k6 run create-resource-example.js
 *   Set environment variables:
 *   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
 *   BASE_URL - the base URL of the resource registry API
 *   Example:
 *   ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud k6 run create-access-package-resource.js
 *   Also the TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must be set in the environment for token generation
*/

import { ResourceRegistryApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { getResourceBody } from "./templates/resource-templates.js";
import { getDefaultPolicyXml } from "./templates/policy-builder.js";

let resourceRegistryApiClient = undefined;

export default function () {
    // OrgNo for ttd is 991825827 except in yt01 where it is 713431400.
    let orgNo = "991825827";
    if (__ENV.ENVIRONMENT === "yt01") {
        orgNo = "713431400";
    }
    const orgCode = "ttd";

    if (resourceRegistryApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:resourceregistry/resource.write altinn:resourceregistryresource.read altinn:resourceregistry/resource.admin");
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL, tokenGenerator);
    }
  
    const resourceId = "k6-resource-example";
    const resourceBody = getResourceBody("default", resourceId, orgNo, orgCode);

    const resourceResp = resourceRegistryApiClient.PostResource(resourceBody); 
    if (resourceResp.status === 201) {
        console.log(`Resource created: ${resourceId}`);
        const policyXml = getDefaultPolicyXml(resourceId);
        const policyResp = resourceRegistryApiClient.PostPolicy(resourceId, policyXml);
        if (policyResp.status === 201) {
            console.log(`Policy created for resource: ${resourceId}`);
        }
    }
}

