import { group } from "k6";

import { RequestSystemUserClient } from "../../../../clients/authentication/v2/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { RequestSystemUser } from "../../../building-blocks/authentication/v2/request-system-user/index.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { SystemUserRequestDomainChecks } from "../../../domain-checks/system-user-request.js";

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: System user requests by system id (vendor) and pagination.
 *
 * Ensures that paginated access to system user requests by systemId works through APIM.
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

    group("As a vendor, I can list system user requests by system id and follow pagination", function () {
        let firstPage;

        group("Fetch the first page of system user requests", function () {
            firstPage = RequestSystemUser.VendorGetBySystem(requestSystemUserClient, systemId);

            SystemUserRequestDomainChecks.CheckPaginatedShape(firstPage, "VendorGetBySystem");
            SystemUserRequestDomainChecks.CheckPaginatedNotEmpty(firstPage, "VendorGetBySystem");
            SystemUserRequestDomainChecks.CheckRequestsBelongToSystem(firstPage, systemId);
        });

        group("Follow the next-link pagination", function () {
            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(tokenGenerator.getToken(), nextUrl);
            }

            SystemUserRequestDomainChecks.CheckMultiplePages(1 + additionalPages, "VendorGetBySystem");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
