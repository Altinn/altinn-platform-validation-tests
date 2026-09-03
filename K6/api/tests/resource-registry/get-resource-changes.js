import { group } from "k6";

import { ResourceChangesQueryBuilder } from "../../../clients/resource-registry/index.js";
import { ResourceChangePaginated } from "../../../clients/resource-registry/types.js";
import { requireEnv } from "../../../helpers.js";
import { ResourceChanges, ResourceChangesRefused } from "../../building-blocks/resource-registry/resource/index.js";
import { PaginationDomainChecks } from "../../domain-checks/common/pagination.js";
import { ResourceChangesDomainChecks } from "../../domain-checks/resource-registry/resource-changes.js";
import { getPublicResourceClient } from "./commons.js";

const firstPageLabel = { step: "1. Read the first page of the feed" };
const secondPageLabel = { step: "2. Follow the next link" };
const limitTooLowLabel = { step: "3. Ask for a limit below the range" };
const limitTooHighLabel = { step: "4. Ask for a limit above the range" };

// Small enough that every environment has more changes than this, so the feed
// hands out a next link and there is a second page to read.
const PAGE_SIZE = 5;

// The registry accepts 1 to 1000 and refuses anything else.
const LIMIT_BELOW_RANGE = 0;
const LIMIT_ABOVE_RANGE = 1001;

// The part of the request the registry names when it refuses the limit.
const LIMIT_PATH = "/$QUERY/limit";

/**
 * Reads the continuation token out of a next link.
 *
 * The token is opaque and only ever comes from a next link, so it is taken from
 * the link rather than built. Pulling it out and asking the client again, instead
 * of fetching the link directly, is what puts the token through the query builder
 * and the client the way a consumer of the feed would use them.
 *
 * @param {ResourceChangePaginated|null} changes - The page that carried the link.
 * @returns {string|null} The token, or null when there was no next link to read it from.
 */
function continuationTokenFrom(changes) {
    const match = `${changes?.links?.next}`.match(/[?&]token=([^&]+)/);

    return match === null ? null : decodeURIComponent(match[1]);
}

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the changes feed can be paged through.
 *
 * The endpoint is public, so the client is built without a token generator and the
 * test can run as a healthcheck all the way to prod.
 *
 * The feed holds every resource that has had a policy uploaded at least once, and
 * each resource appears at most once, at the position of its latest change. That
 * last part is what the test leans on: reading two pages and checking that no
 * resource turns up in both says the continuation token moved the walk forward,
 * which counting pages cannot.
 *
 * The changes are ordered by an internal change id and not by the timestamp they
 * report, so the test deliberately does not assert that changedAt rises across
 * the feed. It does not, in any environment.
 */
export default function () {
    const resourceClient = getPublicResourceClient();

    const expectedBaseUrl = `${__ENV.BASE_URL}/resourceregistry/`;

    /** @type {ResourceChangePaginated|null} */
    let firstPage = null;

    group("1. Read the first page of the feed", () => {
        const query = new ResourceChangesQueryBuilder()
            .limit(PAGE_SIZE)
            .build();

        firstPage = ResourceChanges(resourceClient, query, firstPageLabel);

        PaginationDomainChecks.CheckPaginatedShape(firstPage, "ResourceChanges");
        ResourceChangesDomainChecks.CheckChangesIdentified(firstPage, "ResourceChanges");
        ResourceChangesDomainChecks.CheckPageHoldsLimit(firstPage, PAGE_SIZE, "ResourceChanges");
        PaginationDomainChecks.CheckNextLink(firstPage, expectedBaseUrl, "ResourceChanges");
    });

    const token = continuationTokenFrom(firstPage);

    if (token !== null) {
        group("2. Follow the next link", () => {
            const query = new ResourceChangesQueryBuilder()
                .token(token)
                .limit(PAGE_SIZE)
                .build();

            const secondPage = ResourceChanges(resourceClient, query, secondPageLabel);

            ResourceChangesDomainChecks.CheckChangesIdentified(secondPage, "ResourceChanges");
            ResourceChangesDomainChecks.CheckResourcesAppearOnce(
                [firstPage, secondPage],
                "ResourceChanges",
            );
        });
    }

    group("3. Ask for a limit below the range", () => {
        const query = new ResourceChangesQueryBuilder()
            .limit(LIMIT_BELOW_RANGE)
            .build();

        const problem = ResourceChangesRefused(resourceClient, 400, query, limitTooLowLabel);

        ResourceChangesDomainChecks.CheckValidationErrorForPath(
            problem,
            LIMIT_PATH,
            "ResourceChangesRefused",
        );
    });

    group("4. Ask for a limit above the range", () => {
        const query = new ResourceChangesQueryBuilder()
            .limit(LIMIT_ABOVE_RANGE)
            .build();

        const problem = ResourceChangesRefused(resourceClient, 400, query, limitTooHighLabel);

        ResourceChangesDomainChecks.CheckValidationErrorForPath(
            problem,
            LIMIT_PATH,
            "ResourceChangesRefused",
        );
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
