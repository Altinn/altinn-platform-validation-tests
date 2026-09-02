import { fail, group } from "k6";

import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemUserBuildingBlocks, SystemUserClient } from "../../../authentication-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
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
 * Creates and caches the client this test reads with.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {{systemUserClient: SystemUserClient, tokenGenerator: EnterpriseTokenGenerator}} The client, and the generator the pagination helper needs to follow next links.
 */
const getClients = lazy(function () {
    // The vendor endpoint sits behind the system register scope, not a system user one.
    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE]))
            .withOrganizationNumber(SYSTEM_OWNER)
            .build(),
    );

    return { systemUserClient: new SystemUserClient(__ENV.BASE_URL, tokenGenerator), tokenGenerator };
});

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
    const { systemUserClient, tokenGenerator } = getClients();

    group("As a vendor, I can list system users by system id and follow pagination", function () {
        const firstPage = group("Fetch the first page of system users", function () {
            const page = SystemUserBuildingBlocks.VendorGetBySystem(systemUserClient, SYSTEM_ID);

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, "VendorGetBySystem")) {
                fail("cannot follow pagination: the first page of system users is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(page, "VendorGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(page, SYSTEM_ID, "system user");

            return page;
        });

        group("Follow the next-link pagination", function () {
            PaginationDomainChecks.CheckNextLink(firstPage, `${__ENV.BASE_URL}/authentication/`, "VendorGetBySystem");

            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(tokenGenerator.getToken(), nextUrl);
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, "VendorGetBySystem");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
