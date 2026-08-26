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

        group("Follow the stream to the next pages", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, OPERATION);
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, OPERATION);

            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(tokenGenerator.getToken(), nextUrl);
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, OPERATION);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
