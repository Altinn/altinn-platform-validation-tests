import { ResourceClient, ResourceUpdatedQueryBuilder } from "../../../../clients/resource-registry/index.js";
import { requireEnv } from "../../../../helpers.js";
import { ResourceUpdated } from "../../../building-blocks/resource-registry/resource/index.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the updated resources feed hands out a usable next link.
 *
 * The endpoint is public, so the client is built without a token generator and the
 * test can run as a healthcheck all the way to prod.
 */
export default function () {
    const resourceClient = new ResourceClient(__ENV.BASE_URL);

    const expectedBaseUrl = `${__ENV.BASE_URL}/resourceregistry/`;

    const query = new ResourceUpdatedQueryBuilder()
        .since("2000-01-01T01:00:00.000Z")
        .limit(10)
        .build();

    const updatedResources = ResourceUpdated(resourceClient, query);

    PaginationDomainChecks.CheckNextLink(updatedResources, expectedBaseUrl, "ResourceUpdated");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
