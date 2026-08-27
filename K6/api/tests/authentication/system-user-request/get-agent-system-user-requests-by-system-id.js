import { fail, group } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { RequestSystemUserBuildingBlocks } from "../../../authentication-imports.js";
import { collectNextUrlPages, extractNextUrl } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getPaginationClients, PAGINATION_SYSTEM_ID } from "./commons.js";

/**
 * Name the checks report under.
 */
const OPERATION = "RequestSystemUserVendorAgentGetBySystem";

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: Agent system user requests by system id (vendor) and pagination.
 *
 * Ensures that paginated access to agent system user requests by systemId works through APIM.
 */
export default function () {
    const [requestSystemUserClient, tokenGenerator] = getPaginationClients();

    group("As a vendor, I can list agent system user requests by system id and follow pagination", function () {
        const firstPage = group("Fetch the first page of agent system user requests", function () {
            const page = RequestSystemUserBuildingBlocks.VendorAgentGetBySystem(requestSystemUserClient, PAGINATION_SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, OPERATION)) {
                fail("cannot follow pagination: the first page of agent system user requests is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);
            PaginationDomainChecks.CheckItemsBelongToSystem(page, PAGINATION_SYSTEM_ID, "agent system user request");

            return page;
        });

        group("Follow the next links on the agent system user requests", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, OPERATION);

            const nextUrl = extractNextUrl(firstPage);

            const { pages, repeatedUrl, failedUrl, failedStatus } = nextUrl === null
                ? { pages: [], repeatedUrl: null, failedUrl: null, failedStatus: null }
                : collectNextUrlPages(tokenGenerator.getToken(), nextUrl);

            PaginationDomainChecks.CheckNextLinksDoNotRepeat(repeatedUrl, OPERATION);

            // A walk that dies on its last page still returns every page before it,
            // so without this the distinct count below is satisfied by the prefix.
            PaginationDomainChecks.CheckEveryPageLoaded(failedUrl, failedStatus, OPERATION);

            // Every page answers for itself. Reading only the first page would let a
            // later one belong to another system, or hold nothing, without anyone
            // noticing.
            for (const page of pages) {
                PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);
                PaginationDomainChecks.CheckItemsBelongToSystem(page, PAGINATION_SYSTEM_ID, "agent system user request");
            }

            // Paging has to reach requests the first page did not hold. Counting pages
            // cannot say that, since a page that repeats the first one still counts.
            const seen = new Set();
            for (const page of [firstPage, ...pages]) {
                for (const item of page?.data ?? []) {
                    seen.add(/** @type {{id?: string}} */ (item)?.id);
                }
            }

            PaginationDomainChecks.CheckPagesHoldDistinctItems(seen.size, firstPage?.data?.length ?? 0, OPERATION);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
