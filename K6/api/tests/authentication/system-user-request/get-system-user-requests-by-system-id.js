// todo: Can I import this here or should it be put in a package.json etc
import { describe, expect } from "https://jslib.k6.io/k6chaijs/4.5.0.1/index.js";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { followLinksNext } from "../../../building-blocks/common/follow-links-next.js";
import { getVendorTokenGenerator } from "../../../building-blocks/authentication/common/get-vendor-token-generator.js";

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
 * Test: System User Requests By SystemId (vendor) + pagination.
 *
 * Ensures that paginated access to system user requests by systemId (vendor endpoint) works correctly through APIM.
 */
export default function () {
    // Constants for now, could be replaced, but I have prepped this
    // in at22 and tt02. Won't work anywhere else.
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker";

    const vendorTokenGenerator = getVendorTokenGenerator({
        systemOwnerOrgNo,
        scopes:
            "altinn:authentication/systemuser.read altinn:authentication/systemuser.request.read altinn:authentication/systemregister.write",
    });
    const systemUserRequestApiClient = new SystemUserRequestApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    describe("Get system user requests by systemId (vendor) + pagination", () => {
        // Expected pagination format: .../vendor/bysystem/{systemId}?token=...
        const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/request/vendor/bysystem/${systemId}?token=`;

        const firstRes = systemUserRequestApiClient.GetSystemUserRequestsBySystemIdForVendor(systemId);
        expect(firstRes.status, "first page status").to.equal(200);
        const firstBody = firstRes.json();

        // Only follow pagination if we actually have a next link
        if (firstBody && firstBody.links && firstBody.links.next) {
            followNextLinks(systemUserRequestApiClient, firstBody, expectedNextBaseUrl);
        }
    });
}

