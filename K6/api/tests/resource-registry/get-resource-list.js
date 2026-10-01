import { group } from "k6";

import { ServiceResource } from "../../../clients/resource-registry/types.js";
import { requireEnv } from "../../../helpers.js";
import { ResourceGetResourceList } from "../../building-blocks/resource-registry/resource/index.js";
import { ResourceListDomainChecks } from "../../domain-checks/resource-registry/resource-list.js";
import { getPublicResourceClient } from "./commons.js";

const withoutAppsLabel = { step: "1. List the catalogue without apps" };
const withAppsLabel = { step: "2. List the catalogue with apps" };

// The catalogue is handed out in one response, and the size of it is what the two
// parameters decide: without the apps it is 0.6 to 7 MB depending on the
// environment, with them 1.4 to 15 MB.
const WITHOUT_APPS = { includeApps: false, includeMigratedApps: false };
const WITH_APPS = { includeApps: true, includeMigratedApps: true };

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the resource catalogue can be listed, and the app parameters decide what
 * is in it.
 *
 * The endpoint is public, so the client is built without a token generator and the
 * test can run as a healthcheck all the way to prod.
 *
 * Listing the catalogue once would only say that the endpoint answered. The
 * assertion worth having is that includeApps and includeMigratedApps are the only
 * difference between the two answers: everything the list hands out without them
 * is handed out with them as well, and the resources that come on top are apps
 * and nothing else. A parameter that is ignored fails one of the two.
 *
 * The check is on what the two answers differ by and not on the types in either
 * of them, because the list asked without the apps is not free of app types: it
 * keeps a handful of AltinnApp and MigratedApp resources in every environment, 6
 * of 398 in at22 and 637 of 3374 in tt02. The parameters go by more than the
 * resource type, so a check for no app type at all would fail everywhere.
 */
export default function () {
    const resourceClient = getPublicResourceClient();

    /** @type {Array<ServiceResource>|null} */
    let withoutApps = null;

    group("1. List the catalogue without apps", () => {
        withoutApps = ResourceGetResourceList(resourceClient, WITHOUT_APPS, withoutAppsLabel);

        ResourceListDomainChecks.CheckResourcesIdentified(withoutApps, "ResourceGetResourceList");
        ResourceListDomainChecks.CheckResourcesUnique(withoutApps, "ResourceGetResourceList");
    });

    group("2. List the catalogue with apps", () => {
        const withApps = ResourceGetResourceList(resourceClient, WITH_APPS, withAppsLabel);

        ResourceListDomainChecks.CheckResourcesIdentified(withApps, "ResourceGetResourceList");
        ResourceListDomainChecks.CheckResourcesUnique(withApps, "ResourceGetResourceList");
        ResourceListDomainChecks.CheckResourcesContained(
            withoutApps,
            withApps,
            "ResourceGetResourceList without apps",
            "ResourceGetResourceList with apps",
        );
        ResourceListDomainChecks.CheckExtraResourcesAreApps(
            withoutApps,
            withApps,
            "ResourceGetResourceList without apps",
            "ResourceGetResourceList with apps",
        );
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
