import { fail, group } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { SystemUserBuildingBlocks, SystemUserDomainChecks } from "../../../authentication-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getStreamClients } from "./commons.js";

/**
 * Name the checks report under.
 */
const OPERATION = "SystemUserInternalStream";

/**
 * How many pages the walk follows at most, before the stats narrow it further.
 */
const MAX_PAGES = 10;

/**
 * How many pages are left to read, going by the stats.
 *
 * The generic follower stops on a next link that repeats or a page that returns the
 * same body, since that is what a finished list looks like. A stream does not have
 * to end that way: the Register pattern keeps handing out a token so a reader can
 * come back for what arrives later, which would read as stuck rather than as done.
 * Stopping where the stats say the stream ends keeps the walk from ever getting
 * there.
 *
 * @param {{pageStart: number, pageEnd: number, sequenceMax: number}} stats - The stats from the first page.
 * @returns {number} Pages left after the first, at most MAX_PAGES.
 */
function pagesLeft(stats) {
    const pageSize = stats.pageEnd - stats.pageStart + 1;
    const left = Math.ceil((stats.sequenceMax - stats.pageEnd) / pageSize);

    return Math.max(1, Math.min(MAX_PAGES, left));
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: the internal system user stream, which Register reads.
 *
 * Unlike the other listings this one is not scoped to a system or a vendor, so there
 * is nothing to arrange: the environment's own system users are the data. That also
 * means the test cannot assume there is more than one page of them, and a freshly
 * reset environment would make a hard expectation of one fail while the endpoint was
 * behaving correctly. What it does instead is read the stats, which say where in the
 * stream the page sits and how far behind it is, and let those decide what the rest
 * has to hold: a stream with more to give has to hand out a link to it, and one that
 * has been read to the end has to say so by handing out none.
 */
export default function () {
    const [systemUserClient, tokenGenerator] = getStreamClients();

    group("As Register, I can stream every system user and follow the stream on", function () {
        const firstPage = group("Fetch the first page of the stream", function () {
            const page = SystemUserBuildingBlocks.InternalStream(systemUserClient);

            // Everything below reads off the page, so one that is missing or shaped
            // wrong ends the iteration here rather than failing every check on the
            // same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, OPERATION)) {
                fail("cannot follow the stream: the first page is not a paginated response");
            }

            SystemUserDomainChecks.CheckStreamStats(page, OPERATION);

            return page;
        });

        group("Follow the stream to the next pages", function () {
            // The stats, and not the environment, decide whether there is anything
            // left to follow. fail() above means there is a page to read them off.
            if (firstPage === null || !SystemUserDomainChecks.CheckStreamHasMore(firstPage, OPERATION)) {
                return;
            }

            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, OPERATION);
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, OPERATION);

            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(tokenGenerator.getToken(), nextUrl, pagesLeft(firstPage.stats));
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, OPERATION);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
