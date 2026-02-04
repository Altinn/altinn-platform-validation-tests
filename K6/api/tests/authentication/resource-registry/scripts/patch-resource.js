import { ResourceRegistryApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";

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

    const resourceResp = resourceRegistryApiClient.GetResource("k6-generated-resource-01"); 
    console.log(resourceResp.status);
    console.log(JSON.stringify(JSON.parse(resourceResp.body), null, 2));
    const resource = JSON.parse(resourceResp.body);
    const patch = {
        set: {
            version: "versjon 1",
            status: "Completed",
            selfIdentifiedUserEnabled: true,
            delegable: true,
            visible: true,
            selfIdentifiedUserEnabled: true,
            enterpriseUserEnabled: false,
            availableForType: [
                "PrivatePerson"
            ],
        },
        remove: [
            ["isPartOf"],
            ["resourceReferences"],
            ["authorizationReference"]
        ],
    }
    const resourceName = "k6-generated-resource-01";
    const updatedResource = applyPatch(resource, patch);
    console.log("Merged Resource:", JSON.stringify(updatedResource, null, 2));

    const updateResp = resourceRegistryApiClient.PutResource(resourceName, updatedResource);
    console.log("Update status:", updateResp.status);

}

function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(target?.[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function removePath(obj, path) {
  if (path.length === 0) return obj;

  const [key, ...rest] = path;

  if (!(key in obj)) return obj;

  if (rest.length === 0) {
    const { [key]: _, ...out } = obj;
    return out;
  }

  return {
    ...obj,
    [key]: removePath(obj[key], rest),
  };
}

function applyPatch(original, patch) {
  let result = { ...original };

  // 1) removals
  if (patch.remove) {
    for (const path of patch.remove) {
      result = removePath(result, path);
    }
  }

  // 2) sets / updates
  if (patch.set) {
    result = deepMerge(result, patch.set);
  }

  return result;
}
