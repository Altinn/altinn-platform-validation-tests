import { check, group, fail } from "k6";

import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { GetSystemUserRequestsBySystemId } from "../../../building-blocks/authentication/system-user-request/index.js";
import {
    extractNextUrl,
    followNextUrlPagination,
} from "../../../../clients/common/get-next-url-paginated-response.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

/**
 * Test: System User Requests By SystemId (vendor) + pagination.
 *
 * Ensures that paginated access to system user requests by systemId (vendor endpoint) works correctly through APIM.
 */
export default function () {
    group("System User Requests By SystemId (vendor) + pagination", () => {
        const systemOwnerOrgNo = "312605031";
        const systemId = "312605031_Virksomhetsbruker";

        const vendorTokenOptions = new Map();
        vendorTokenOptions.set("env", __ENV.ENVIRONMENT);
        vendorTokenOptions.set("ttl", 3600);
        vendorTokenOptions.set(
            "scopes",
            "altinn:authentication/systemuser.read altinn:authentication/systemuser.request.read altinn:authentication/systemregister.write",
        );
        vendorTokenOptions.set("orgNo", systemOwnerOrgNo);

        const vendorTokenGenerator = new EnterpriseTokenGenerator(
            vendorTokenOptions,
        );
        const systemUserRequestApiClient = new SystemUserRequestApiClient(
            __ENV.BASE_URL,
            vendorTokenGenerator,
        );

        const firstBody = group(
            "GET first page for system user requests by system id",
            () =>
                GetSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId),
        );

        const ok = check(firstBody, {
            "firstBody contains data": (r) => r.includes("\"data\""),
            "firstBody contains links": (r) => r.includes("\"links\""),
            "firstBody is not empty": (r) => r.length > 0,
        });
        if (!ok) {
            fail("Expected to find system user requests, but found none");
        }

        const pages = group("Follow next-link pagination", () => {
            const token = vendorTokenGenerator.getToken();
            const nextUrl = extractNextUrl(firstBody);
            const additionalPages = followNextUrlPagination(token, nextUrl);
            return 1 + additionalPages;
        });

        const passed = check(pages, {
            "returns more than 1 page": (p) => p > 1,
        });

        if (!passed) {
            console.log(
                "Expected to find more than 1 page for System User Requests By System Id endpoint",
            );
        }

        console.log("PAGES", pages);
    });
}

export { handleSummary } from "../../../../common-imports.js";
