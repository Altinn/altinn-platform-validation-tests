import { group } from "k6";

import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemUserBuildingBlocks, SystemUserClient } from "../../../authentication-v2-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";

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
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker";

    // The vendor endpoint sits behind the system register scope, not a system user one.
    const scopes = CreateScopeString([
        AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE
    ]);

    const options = new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .withOrganizationNumber(systemOwnerOrgNo)
        .build();

    const tokenGenerator = new EnterpriseTokenGenerator(options);

    const systemUserClient
        = new SystemUserClient(__ENV.BASE_URL, tokenGenerator);

    group("As a vendor, I can list system users by system id and follow pagination", function () {
        let firstPage;

        group("Fetch the first page of system users", function () {
            firstPage = SystemUserBuildingBlocks.VendorGetBySystem(systemUserClient, systemId);

            PaginationDomainChecks.CheckPaginatedShape(firstPage, "VendorGetBySystem");
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "VendorGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(firstPage, systemId, "system user");
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
