import { ResourceClient } from "../../../clients/resource-registry/index.js";
import { lazy, requireEnv } from "../../../helpers.js";
import { ResourceExport, ResourceGetResourceList } from "../../building-blocks/resource-registry/resource/index.js";
import { RdfExportDomainChecks } from "../../domain-checks/resource-registry/rdf-export.js";

/**
 * Both endpoints are public, so the client is built without a token generator.
 * Built once per VU, on the first iteration that asks for it.
 *
 * @returns {ResourceClient} The client.
 */
const getResourceClient = lazy(function () {
    return new ResourceClient(__ENV.BASE_URL);
});

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the RDF export carries the contact points the registry stores.
 *
 * CPSV-AP-NO makes cv:contactPoint mandatory on a public service, and the
 * export left it out until Altinn/altinn-auth#4582. The test compares the export
 * with the resource list, so it needs no test data of its own and covers every
 * contact point in the environment, including the ones with an invalid contact
 * page that the export should skip.
 */
export default function () {
    const resourceClient = getResourceClient();

    const rdf = ResourceExport(resourceClient);
    const resources = ResourceGetResourceList(resourceClient);

    RdfExportDomainChecks.CheckContactPointsExported(rdf, resources, "ResourceExport");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
