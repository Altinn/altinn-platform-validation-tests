/*
 *   Script to create resources and policies for access packages in the resource registry.
 *   Run: k6 run create-access-package-resource.js
 *   Set environment variables:
 *   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
 *   BASE_URL - the base URL of the resource registry API
 *   Example:
 *   ENVIRONMENT=yt01 BASE_URL=https://platform.at22.altinn.cloud k6 run create-access-package-resource.js
 *   Also the TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must be set in the environment for token generation
*/

import { ResourceRegistryApiClient, AccessPackagesApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { getResourceBody } from "../templates/resource-templates.js";
import { getAccessPackagePolicyXml, getDefaultPolicyXml } from "../templates/policy-builder.js";

let resourceRegistryApiClient = undefined;
let accessPackagesApiClient = undefined;

export default function () {
    // OrgNo for ttd is 991825827 except in yt01 where it is 713431400.
    let orgNo = "991825827";
    if (__ENV.ENVIRONMENT === "yt01") {
        orgNo = "713431400";
    }

    if (resourceRegistryApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:resourceregistry/resource.write altinn:resourceregistryresource.read altinn:resourceregistry/resource.admin");
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL, tokenGenerator);
    }

    accessPackagesApiClient = new AccessPackagesApiClient(__ENV.BASE_URL);
    const searchOpt = { typeName: "person" };
    const accessPackageResp = accessPackagesApiClient.Search(searchOpt);

    const resp = JSON.parse(accessPackageResp.body);
    for (const item of resp) {
        const accessPackage = item.object.urn.split(":").pop();
        const resourceId = `k6-test-${accessPackage}`;
        console.log(`Processing resource: ${resourceId}`);
        if (resourceId !== "k6-test-innbygger-sykefravaer") {
          continue;
        }
        const policy = getDefaultPolicyXml(resourceId); //buildPolicy(policyDefinition, resourceName);
        const policyResp1 = resourceRegistryApiClient.PostPolicy(resourceId, policy);
        if (policyResp1.status === 201) {
            console.log(`Wrong policy created for resource: ${resourceId}`);
        } 
        const policyXml = getAccessPackagePolicyXml(resourceId, accessPackage);
        const policyResp2 = resourceRegistryApiClient.PostPolicy(resourceId, policyXml);
        if (policyResp2.status === 201) {
            console.log(`Policy created for resource: ${resourceId}`);
        }
        break;
    }

}

