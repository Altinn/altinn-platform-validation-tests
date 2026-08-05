import { group } from "k6";

import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemUserBuildingBlocks, SystemUserClient } from "../../../authentication-v2-imports.js";
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
    if (systemUserClient === undefined) {
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
        let firstPage;

        group("Fetch the first page of system users", function () {
            firstPage = SystemUserBuildingBlocks.VendorGetBySystem(systemUserClient, SYSTEM_ID);

            PaginationDomainChecks.CheckPaginatedShape(firstPage, "VendorGetBySystem");
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "VendorGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(firstPage, SYSTEM_ID, "system user");
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
