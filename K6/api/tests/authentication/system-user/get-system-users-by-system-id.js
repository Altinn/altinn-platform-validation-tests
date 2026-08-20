import { fail, group } from "k6";

import { SystemUserBuildingBlocks } from "../../../authentication-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getClients, PAGINATION_SYSTEM_ID } from "./commons.js";

export { setup } from "./commons.js";

/**
 * Test: System users by system id (vendor) and pagination.
 *
 * Ensures that paginated access to system users by systemId works through APIM.
 */
export default function () {
    // The vendor endpoint sits behind the system register scope, not a system user
    // one, which is what the vendor clients in commons.js carry.
    const clients = getClients();
    const systemUserClient = clients.vendor.systemUserClient;

    group("As a vendor, I can list system users by system id and follow pagination", function () {
        let firstPage;

        group("Fetch the first page of system users", function () {
            firstPage = SystemUserBuildingBlocks.VendorGetBySystem(systemUserClient, PAGINATION_SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(firstPage, "VendorGetBySystem")) {
                fail("cannot follow pagination: the first page of system users is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "VendorGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(firstPage, PAGINATION_SYSTEM_ID, "system user");
        });

        group("Follow the next-link pagination", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, "VendorGetBySystem");

            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(clients.vendor.tokenGenerator.getToken(), nextUrl);
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, "VendorGetBySystem");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
