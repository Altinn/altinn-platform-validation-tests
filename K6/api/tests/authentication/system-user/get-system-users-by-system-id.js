import { check, group, fail } from "k6";

import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { GetSystemUsersBySystemId } from "../../../building-blocks/authentication/system-user/index.js";
import {
    extractNextUrl,
    followNextUrlPagination,
} from "../../../building-blocks/common/follow-next-url-pagination.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

/**
 * Test: System Users By SystemId (vendor) + pagination.
 *
 * Ensures that paginated access to system users by systemId (vendor endpoint) works correctly through APIM.
 */
export default function () {
    const testRef = "System users by system id";
    group(
        "Scenario: As a vendor, I can list system users by system id and follow pagination.",
        () => {
            const systemOwnerOrgNo = "312605031";
            const systemId = "312605031_Virksomhetsbruker";

            const vendorTokenOptions = new Map();
            vendorTokenOptions.set("env", __ENV.ENVIRONMENT);
            vendorTokenOptions.set("ttl", 3600);
            vendorTokenOptions.set(
                "scopes",
                "altinn:authentication/systemregister.write",
            );
            vendorTokenOptions.set("orgNo", systemOwnerOrgNo);

            const vendorTokenGenerator = new EnterpriseTokenGenerator(
                vendorTokenOptions,
            );
            const systemUserApiClient = new SystemUserApiClient(
                __ENV.BASE_URL,
                vendorTokenGenerator,
            );

            let firstBody;
            let firstJson;
            group(`Step: ${testRef} - Fetch the first page of system users.`, () => {
                firstBody = GetSystemUsersBySystemId(systemUserApiClient, systemId);
                if (typeof firstBody !== "string" || firstBody.length === 0) {
                    fail("The response body is empty or missing.");
                }
                firstJson = JSON.parse(firstBody);

                const ok = check(firstJson, {
                    "The response has a 'data' field.": (r) => "data" in r,
                    "The response has a 'links' field.": (r) => "links" in r,
                    "The response body is not empty.": () => firstBody.length > 0,
                });
                if (!ok) {
                    fail("Expected to find system users, but found none");
                }
            });

            group(
                `Step: ${testRef} - Follow the next-link pagination (links.next).`,
                () => {
                    const token = vendorTokenGenerator.getToken();
                    const nextUrl = extractNextUrl(firstJson);
                    if (!nextUrl) {
                        fail("Couldn't find next URL on first page for system users");
                    }
                    const additionalPages = followNextUrlPagination(token, nextUrl);
                    const pages = 1 + additionalPages;
                    check(pages, {
                        "System users by system id: More than one page is returned.": (p) =>
                            p > 1,
                    });
                },
            );
        },
    );
}

export { handleSummary } from "../../../../common-imports.js";
