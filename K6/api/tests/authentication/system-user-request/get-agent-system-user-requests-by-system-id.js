// todo: Can I import this here or should it be put in a package.json etc
import { describe, expect } from "https://jslib.k6.io/k6chaijs/4.5.0.1/index.js";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { followLinksNext } from "../../../building-blocks/common/follow-links-next.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

function followNextLinks(systemUserRequestApiClient, firstPageBody, expectedBaseUrl, maxPages = 20) {
    return followLinksNext({
        firstBody: firstPageBody,
        expectedNextBaseUrl: expectedBaseUrl,
        maxPages,
        fetchByUrl: (url) => systemUserRequestApiClient.GetSystemUserRequestsByUrl(url),
        pageLabel: "page",
    }).pages;
}

/**
 * Test: Agent System User Requests By SystemId (vendor) + pagination.
 *
 * Ensures that paginated access to agent system user requests by systemId (vendor endpoint) works correctly through APIM.
 */
export default function () {
    // Constants for now, could be replaced, but I have prepped this
    // in at22 and tt02. Won't work anywhere else.
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker";

    // Token setup is intentionally kept in the test to showcase required settings.
    const vendorTokenOptions = new Map();
    vendorTokenOptions.set("env", __ENV.ENVIRONMENT);
    vendorTokenOptions.set("ttl", 3600);
    vendorTokenOptions.set(
        "scopes",
        "altinn:authentication/systemuser.read altinn:authentication/systemuser.request.read altinn:authentication/systemregister.write"
    );
    vendorTokenOptions.set("orgNo", systemOwnerOrgNo);
    const vendorTokenGenerator = new EnterpriseTokenGenerator(vendorTokenOptions);

    const systemUserRequestApiClient = new SystemUserRequestApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    describe("Get agent system user requests by systemId (vendor) + pagination", () => {
        // Expected pagination format: .../vendor/agent/bysystem/{systemId}?token=...
        const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/request/vendor/agent/bysystem/${systemId}?token=`;

        const firstRes = systemUserRequestApiClient.GetAgentSystemUserRequestsBySystemIdForVendor(systemId);
        expect(firstRes.status, "first page status").to.equal(200);
        const firstBody = firstRes.json();

        // Only follow pagination if we actually have a next link
        if (firstBody && firstBody.links && firstBody.links.next) {
            followNextLinks(systemUserRequestApiClient, firstBody, expectedNextBaseUrl);
        }
    });
}

