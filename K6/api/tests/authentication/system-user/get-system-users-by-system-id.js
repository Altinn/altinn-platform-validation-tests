import { fail, group } from "k6";

import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemUserBuildingBlocks, SystemUserClient } from "../../../authentication-imports.js";
import { collectNextUrlPages, extractNextUrl } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";

/**
 * The vendor whose existing system this test reads from.
 */
const SYSTEM_OWNER = "312605031";

/**
 * The system this test pages through.
 */
const SYSTEM_ID = "312605031_Virksomhetsbruker";

/**
 * Name the checks report under.
 */
const OPERATION = "VendorGetBySystem";

/**
 * @type {SystemUserClient | undefined}
 */
let systemUserClient = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the client this test reads with.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {[SystemUserClient, EnterpriseTokenGenerator]} The client, and the generator the pagination helper needs to follow next links.
 */
function getClients() {
    if (systemUserClient === undefined || tokenGenerator === undefined) {
        // The vendor endpoint sits behind the system register scope, not a system user one.
        tokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE]))
                .withOrganizationNumber(SYSTEM_OWNER)
                .build(),
        );

        systemUserClient = new SystemUserClient(__ENV.BASE_URL, tokenGenerator);
    }

    return [systemUserClient, tokenGenerator];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: System users by system id (vendor) and pagination.
 *
 * Ensures that paginated access to system users by systemId works through APIM.
 */
export default function () {
    const [systemUserClient, tokenGenerator] = getClients();

    group("As a vendor, I can list system users by system id and follow pagination", function () {
        const firstPage = group("Fetch the first page of system users", function () {
            const page = SystemUserBuildingBlocks.VendorGetBySystem(systemUserClient, SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, OPERATION)) {
                fail("cannot follow pagination: the first page of system users is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);
            PaginationDomainChecks.CheckItemsBelongToSystem(page, SYSTEM_ID, "system user");

            return page;
        });

        group("Follow the next links on the system users", function () {
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
                PaginationDomainChecks.CheckItemsBelongToSystem(page, SYSTEM_ID, "system user");
            }

            // Paging has to reach system users the first page did not hold. Counting
            // pages cannot say that, since a page that repeats the first one still
            // counts.
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
