import { group } from "k6";

import { ResourceSearchQueryBuilder } from "../../../clients/resource-registry/index.js";
import { ServiceResource } from "../../../clients/resource-registry/types.js";
import { requireEnv } from "../../../helpers.js";
import { ResourceGetResourceList, ResourceSearch } from "../../building-blocks/resource-registry/resource/index.js";
import { ResourceListDomainChecks } from "../../domain-checks/resource-registry/resource-list.js";
import { getPublicResourceClient } from "./commons.js";

const listLabel = { step: "1. List the catalogue without apps" };
const searchAllLabel = { step: "2. Search without a filter" };
const searchByIdLabel = { step: "3. Search on part of an identifier" };
const searchByOwnerLabel = { step: "4. Search on the resource owner" };
const searchForNothingLabel = { step: "5. Search for something that does not exist" };

// The registry builds an unfiltered search from the resource list with apps and
// migrated apps left out, so the list is asked for the same way to make the two
// comparable. That also keeps the response down: with apps it is 1 to 9 MB
// depending on the environment, without them 0.7 to 7.4 MB.
const LIST_QUERY = { includeApps: false, includeMigratedApps: false };

// Substring of an identifier that exists in every environment. The migrated
// correspondence services came over from Altinn 2 and are not going anywhere.
const KNOWN_IDENTIFIER_SUBSTRING = "migratedcorrespondence";

// The org that owns the resources our own tests create, and one that owns
// resources in every environment.
const KNOWN_ORG_CODE = "ttd";

// An identifier nothing can match. The registry matches on a substring, so this
// has to be a string no identifier can contain.
const UNMATCHABLE_IDENTIFIER = "zzz-no-resource-has-this-in-its-identifier";

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the catalogue can be listed and searched, and the two agree.
 *
 * Both endpoints are public, so the client is built without a token generator and
 * the test can run as a healthcheck all the way to prod.
 *
 * The assertion worth having is that an unfiltered search answers with exactly
 * the resources the list answers with. The registry builds the search from
 * GetResourceList with includeApps false and then filters in memory, so the two
 * have to line up. Checking each endpoint on its own would only say that it
 * answered.
 *
 * The comparison is on identifiers and not on the resources themselves, because
 * the two calls do not have to agree on the payload: the list asks for the
 * current version of each resource, while the search asks for every version and
 * throws away all but the highest version id after the filters have run. The
 * identifier is what both end up with one of per resource.
 *
 * The filters are then checked one at a time: part of an identifier, a resource
 * owner, and a filter nothing can match. Title is left alone on purpose, because
 * the registry never applies it: GetSearchResultsFromResourceList has a matcher
 * for identifier, resource type, owner, description, keywords and reference, but
 * none for title, so a title filter is silently ignored. A search for a title no
 * resource has answers with the whole catalogue, verified in all five
 * environments.
 */
export default function () {
    const resourceClient = getPublicResourceClient();

    /** @type {Array<ServiceResource>|null} */
    let resources = null;

    group("1. List the catalogue without apps", () => {
        resources = ResourceGetResourceList(resourceClient, LIST_QUERY, listLabel);

        ResourceListDomainChecks.CheckResourcesIdentified(resources, "ResourceGetResourceList");
    });

    group("2. Search without a filter", () => {
        const found = ResourceSearch(resourceClient, null, searchAllLabel);

        ResourceListDomainChecks.CheckResourcesIdentified(found, "ResourceSearch");
        ResourceListDomainChecks.CheckSameResources(
            resources,
            found,
            "ResourceGetResourceList",
            "ResourceSearch",
        );
    });

    group("3. Search on part of an identifier", () => {
        const query = new ResourceSearchQueryBuilder()
            .withId(KNOWN_IDENTIFIER_SUBSTRING)
            .build();

        const found = ResourceSearch(resourceClient, query, searchByIdLabel);

        ResourceListDomainChecks.CheckIdentifiersContain(
            found,
            KNOWN_IDENTIFIER_SUBSTRING,
            "ResourceSearch",
        );
    });

    group("4. Search on the resource owner", () => {
        const query = new ResourceSearchQueryBuilder()
            .withOrgCode(KNOWN_ORG_CODE)
            .build();

        const found = ResourceSearch(resourceClient, query, searchByOwnerLabel);

        ResourceListDomainChecks.CheckResourcesOwnedBy(found, KNOWN_ORG_CODE, "ResourceSearch");
    });

    group("5. Search for something that does not exist", () => {
        const query = new ResourceSearchQueryBuilder()
            .withId(UNMATCHABLE_IDENTIFIER)
            .build();

        const found = ResourceSearch(resourceClient, query, searchForNothingLabel);

        ResourceListDomainChecks.CheckNoResources(found, "ResourceSearch");
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
