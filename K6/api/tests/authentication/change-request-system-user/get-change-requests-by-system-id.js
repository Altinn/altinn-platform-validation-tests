import { fail, group } from "k6";

import { ChangeRequestSystemUserBuildingBlocks } from "../../../authentication-imports.js";
import { collectNextUrlPages, extractNextUrl } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getPaginationClients, PAGINATION_SYSTEM_ID } from "./commons.js";

export { paginationSetup as setup } from "./commons.js";

/**
 * Name the checks report under.
 */
const OPERATION = "ChangeRequestSystemUserVendorGetBySystem";

/**
 * Test: a vendor can page through the change requests on one of its systems.
 *
 * The paginating counterpart to list-change-requests-by-system.js, which reads a
 * handful of change requests on a system it registers itself and so only ever sees
 * one page.
 *
 * It does not pass yet, and that is the finding rather than a fault in the test. The
 * first page is correct, fifty items and a next link, but following that link answers
 * the same fifty items and the same token again, in at22, at23, tt02 and yt01 alike.
 * The endpoint ignores the continuation token it hands out, tracked as Altinn/altinn-authentication#2156.
 */
export default function () {
    const [changeRequestClient, tokenGenerator] = getPaginationClients();

    group("As a vendor, I can list the change requests on a system by id and follow pagination", function () {
        const firstPage = group("Fetch the first page of change requests", function () {
            const page = ChangeRequestSystemUserBuildingBlocks.VendorGetBySystem(changeRequestClient, PAGINATION_SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, OPERATION)) {
                fail("cannot follow pagination: the first page of change requests is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);
            PaginationDomainChecks.CheckItemsBelongToSystem(page, PAGINATION_SYSTEM_ID, "change request");

            return page;
        });

        group("Follow the next links on the seeded change request system", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, OPERATION);

            const nextUrl = extractNextUrl(firstPage);

            // The raw link is what tells a stuck endpoint apart from one that hands
            // out no continuation at all, and the two have different fixes. Logged
            // rather than asserted on, since its shape is the endpoint's business.
            console.log(`${OPERATION} - next link from the first page: ${nextUrl}`);

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
                PaginationDomainChecks.CheckItemsBelongToSystem(page, PAGINATION_SYSTEM_ID, "change request");
            }

            // The point of the seeded data: paging has to reach change requests the
            // first page did not hold. Counting pages cannot say that, since a page
            // that repeats the first one still counts as a page.
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
