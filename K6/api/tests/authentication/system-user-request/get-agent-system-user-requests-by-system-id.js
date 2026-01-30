import { check, group, fail } from "k6";

import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { GetAgentSystemUserRequestsBySystemId } from "../../../building-blocks/authentication/system-user-request/index.js";
import {
    extractNextUrl,
    followNextUrlPagination,
} from "../../../building-blocks/common/follow-next-url-pagination.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

export default function () {
    group(
        "Scenario: As a vendor, I can list agent system user requests by system id and follow pagination.",
        () => {
            const systemOwnerOrgNo = "312605031";
            const systemId = "312605031_Virksomhetsbruker";

            const vendorTokenOptions = new Map();
            vendorTokenOptions.set("env", __ENV.ENVIRONMENT);
            vendorTokenOptions.set("ttl", 3600);
            vendorTokenOptions.set(
                "scopes",
                "altinn:authentication/systemuser.request.read",
            );
            vendorTokenOptions.set("orgNo", systemOwnerOrgNo);

            const vendorTokenGenerator = new EnterpriseTokenGenerator(
                vendorTokenOptions,
            );
            const systemUserRequestApiClient = new SystemUserRequestApiClient(
                __ENV.BASE_URL,
                vendorTokenGenerator,
            );

            let firstBody;
            let firstJson;
            group(
                "Step: Agent system user requests by system id - Fetch the first page of agent system user requests.",
                () => {
                    firstBody = GetAgentSystemUserRequestsBySystemId(
                        systemUserRequestApiClient,
                        systemId,
                    );

                    if (typeof firstBody !== "string" || firstBody.length === 0) {
                        fail("The response body is empty or missing.");
                    }
                    firstJson = JSON.parse(firstBody);

                    const ok = check(firstJson, {
                        "The response has a 'data' field.": (r) => "data" in r,
                        "The response has a 'links' field.": (r) => "links" in r,
                        "The response body is not empty.": (r) => r.data.length > 0,
                    });
                    if (!ok) {
                        fail("Expected to find agent system user requests, but found none");
                    }
                },
            );

            group(
                "Step: Agent system user requests by system id - Follow the next-link pagination (links.next).",
                () => {
                    const nextUrl = extractNextUrl(firstJson);
                    if (!nextUrl) {
                        fail(
                            "Couldn't find next URL on first page for agent system user requests",
                        );
                    }
                    const additionalPages = followNextUrlPagination(
                        vendorTokenGenerator.getToken(),
                        nextUrl,
                    );
                    check(additionalPages, {
                        "Agent system user requests: At least one additional page is returned.":
              (p) => p > 0,
                    });
                },
            );
        },
    );
}

export { handleSummary } from "../../../../common-imports.js";
