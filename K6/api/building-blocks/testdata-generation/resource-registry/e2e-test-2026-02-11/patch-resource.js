/*
* An example script that demonstrates how to patch a resource in the Resource Registry API using k6.
* It retrieves an existing resource, applies specified changes, and updates the resource.
* Run: k6 run patch-resource.js
* Set environment variables:
*   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
*   BASE_URL - the base URL of the Resource Registry API
* Example:
*   ENVIRONMENT=yt01 BASE_URL=https://platform.at22.altinn.cloud k6 run patch-resource.js
* TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must also be set in the environment for token generation
*/
import { ResourceRegistryApiClient } from "../../../../../clients/authentication/index.js";
import { AccessPackagesApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { applyPatch } from "../templates/patch-json.js";

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

    const accessPackagesApiClient = new AccessPackagesApiClient(__ENV.BASE_URL);
    const searchOpt = { typeName: "person" };
    const accessPackageResp = accessPackagesApiClient.Search(searchOpt);

    const resp = JSON.parse(accessPackageResp.body);
    const withPrivText = "";
    for (const item of resp) {
        const accessPackage = item.object.urn.split(":").pop();
        const resourceId = `k6-test-${accessPackage}`;

        const resourceResp = resourceRegistryApiClient.GetResource(resourceId); 
        const resource = JSON.parse(resourceResp.body);
        
        const patch = {
            set: {
                title: {
                    en: `Testing resource for ${orgCode}`,
                    nb: `Testressurs for ${orgCode}`,
                    nn: `Testressurs for ${orgCode}`,
              },
                description: {
                    en: `Generic test resource for ${orgCode} on access package ${accessPackage}${withPrivText}`,
                    nb: `Generisk testressurs for ${orgCode} på tilgangspakke ${accessPackage}${withPrivText}`,
                    nn: `Generisk testressurs for ${orgCode} på tilgangspakke ${accessPackage}${withPrivText}`,
                },
                rightDescription: {
                      en: `Read, write and access on access package ${accessPackage}${withPrivText}`,
                      nb: `Lese, skrive og aksess på tilgangspakke ${accessPackage}${withPrivText}`,
                      nn: `Lese, skrive og aksess på tilgangspakke ${accessPackage}${withPrivText}`,
                },
            }
        };
        const updatedResource = applyPatch(resource, patch);

        const updateResp = resourceRegistryApiClient.PutResource(resourceId, updatedResource);
        console.log(`Patched resource: ${resourceId}, Status: ${updateResp.status}`);
    } 
}