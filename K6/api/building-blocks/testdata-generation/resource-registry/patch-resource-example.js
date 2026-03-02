/*
* An example script that demonstrates how to patch a resource in the Resource Registry API using k6.
* It retrieves an existing resource, applies specified changes, and updates the resource.
* Run: k6 run patch-resource.js
* Set environment variables:
*   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
*   BASE_URL - the base URL of the Resource Registry API
* Example:
*   ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud k6 run patch-resource.js
* TOKEN_GENERATOR_USERNAME and TOKEN_GENERATOR_PASSWORD must also be set in the environment for token generation
*/
import { ResourceRegistryApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { applyPatch } from "./templates/patch-json.js";

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
    const orgCode = "ttd";
    const resourceId = "k6-resource-example";

    const resourceResp = resourceRegistryApiClient.GetResource(resourceId); 
    const resource = JSON.parse(resourceResp.body);
    
    const patch = {
        set: {
            title: {
                en: `Testing resource for ${orgCode} (patched)`,
                nb: `Testressurs for ${orgCode} (patched)`,
                nn: `Testressurs for ${orgCode} (patched)`,
            },
            description: {
                en: `Generic test resource for ${orgCode} (patched)`,
                nb: `Generisk testressurs for ${orgCode} (patched)`,
                nn: `Generisk testressurs for ${orgCode} (patched)`,
            },       
        }
    };
    const updatedResource = applyPatch(resource, patch);

    const updateResp = resourceRegistryApiClient.PutResource(resourceId, updatedResource);
    console.log(`Patched resource: ${resourceId}, Status: ${updateResp.status}, Body: ${updateResp.body}`);
}
