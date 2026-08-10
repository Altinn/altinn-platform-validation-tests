import { fail, group } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { RequestSystemUserBuildingBlocks } from "../../../authentication-v2-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getPaginationClients, PAGINATION_SYSTEM_ID } from "./commons.js";

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
        let firstPage;

        group("Fetch the first page of agent system user requests", function () {
            firstPage = RequestSystemUserBuildingBlocks.VendorAgentGetBySystem(requestSystemUserClient, PAGINATION_SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(firstPage, "RequestSystemUserVendorAgentGetBySystem")) {
                fail("cannot follow pagination: the first page of agent system user requests is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "RequestSystemUserVendorAgentGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(firstPage, PAGINATION_SYSTEM_ID, "agent system user request");
        });

        group("Follow the next-link pagination", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, "RequestSystemUserVendorAgentGetBySystem");

            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(tokenGenerator.getToken(), nextUrl);
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, "RequestSystemUserVendorAgentGetBySystem");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
