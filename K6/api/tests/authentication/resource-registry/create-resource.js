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

    const resourceResp = PostResource(resourceRegistryApiClient, "k6-generated-resource-01", "713431400", "digdir"); 
    if (resourceResp.status_code === 201) {
        const policyResp = PostPolicy(resourceRegistryApiClient, "k6-generated-resource-01");
    }

}
