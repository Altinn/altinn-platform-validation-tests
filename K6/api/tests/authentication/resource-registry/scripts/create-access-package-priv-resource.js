import { ResourceRegistryApiClient, AccessPackagesApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { getResourceBody } from "./resource-templates.js";
import { getAccessPackageWithPrivPolicyXml } from "./policy-builder.js";

let resourceRegistryApiClient = undefined;
let accessPackagesApiClient = undefined;

export default function () {
    const orgNo = "991825827"; //"713431400";
    const orgCode = "digdir";

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
        const resourceId = `k6-test-${accessPackage}-with-priv`;
        const resourceBody = getResourceBody("access-package", resourceId, orgNo, orgCode);

        const resourceResp = resourceRegistryApiClient.PostResource(resourceBody); 
        if (resourceResp.status === 201) {
            console.log(`Resource created: ${resourceId}`);
            const policyXml = getAccessPackageWithPrivPolicyXml(resourceId, accessPackage);
            const policyResp = resourceRegistryApiClient.PostPolicy(resourceId, policyXml);
            if (policyResp.status === 201) {
                console.log(`Policy created for resource: ${resourceId}`);
            }
        } else {
            console.log(`Failed to create resource: ${resourceId}. Status: ${resourceResp.status}`);
        }
        break;
    }

}
