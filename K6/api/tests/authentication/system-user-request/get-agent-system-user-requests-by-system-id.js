import { group } from "k6";

import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { RequestSystemUserBuildingBlocks, RequestSystemUserClient } from "../../../authentication-v2-imports.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";

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
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker";

    const scopes = CreateScopeString([
        AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ
    ]);

    const options = new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .withOrganizationNumber(systemOwnerOrgNo)
        .build();

    const tokenGenerator = new EnterpriseTokenGenerator(options);

    const requestSystemUserClient
        = new RequestSystemUserClient(__ENV.BASE_URL, tokenGenerator);

    group("As a vendor, I can list agent system user requests by system id and follow pagination", function () {
        let firstPage;

        group("Fetch the first page of agent system user requests", function () {
            firstPage = RequestSystemUserBuildingBlocks.VendorAgentGetBySystem(requestSystemUserClient, systemId);

            PaginationDomainChecks.CheckPaginatedShape(firstPage, "RequestSystemUserVendorAgentGetBySystem");
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "RequestSystemUserVendorAgentGetBySystem");
            PaginationDomainChecks.CheckItemsBelongToSystem(firstPage, systemId, "agent system user request");
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
