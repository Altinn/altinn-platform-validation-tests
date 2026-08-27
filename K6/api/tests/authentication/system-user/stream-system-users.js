import { fail, group } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { SystemUserBuildingBlocks, SystemUserDomainChecks } from "../../../authentication-imports.js";
import { collectNextUrlPages, extractNextUrl } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getStreamClients } from "./commons.js";

/**
 * Name the checks report under.
 */
const OPERATION = "SystemUserInternalStream";

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: the internal system user stream, which Register reads.
 *
 * There is nothing to arrange: the stream hands out every system user in the
 * environment, so the environment's own data is what it reads. That also means the
 * test cannot take for granted that there is more than one page of them, since a
 * small or freshly reset environment fits on one.
 *
 * The stats decide. They say where in the stream the page sits and how far behind it
 * is, so the test only follows the stream on when they say there is more.
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

            // Stats that do not describe the page are reported here, and nothing
            // below can be read off them.
            return SystemUserDomainChecks.CheckStreamStats(page, OPERATION) ? page : null;
        });

        if (firstPage === null) {
            return;
        }

        // The whole stream fits on this page, so there is nothing to follow.
        if (firstPage.stats.pageEnd >= firstPage.stats.sequenceMax) {
            console.info(`${OPERATION} - the stream ends on the first page: ${JSON.stringify(firstPage.stats)}`);

            return;
        }

        group("Follow the stream past the first page", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, OPERATION);
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, OPERATION);

            const nextUrl = extractNextUrl(firstPage);

            const { pages, repeatedUrl, failedUrl, failedStatus } = nextUrl === null
                ? { pages: [], repeatedUrl: null, failedUrl: null, failedStatus: null }
                : collectNextUrlPages(tokenGenerator.getToken(), nextUrl);

            PaginationDomainChecks.CheckNextLinksDoNotRepeat(repeatedUrl, OPERATION);

            // A walk that dies on its last page still returns every page before it,
            // so without this the distinct count below is satisfied by the prefix.
            PaginationDomainChecks.CheckEveryPageLoaded(failedUrl, failedStatus, OPERATION);

            // The stats above said the stream holds more than this page, so following
            // it has to reach system users the first page did not hold. Counting pages
            // cannot say that, since a page that repeats the first one still counts.
            //
            // The pages themselves are not checked for emptiness the way a listing's
            // are. A stream hands out a next link even when it has caught up, so the
            // walk can read past the end of the data and an empty page there is the
            // stream saying there is nothing new. A page that does not answer at all
            // is a different matter, and the check above covers it.
            const seen = new Set();
            for (const page of [firstPage, ...pages]) {
                for (const item of page?.data ?? []) {
                    seen.add(/** @type {{id?: string|null}} */ (item)?.id);
                }
            }

            PaginationDomainChecks.CheckPagesHoldDistinctItems(seen.size, firstPage?.data?.length ?? 0, OPERATION);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
