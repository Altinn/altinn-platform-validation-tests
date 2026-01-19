import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { describe, expect } from "https://jslib.k6.io/k6chaijs/4.5.0.1/index.js";
import { followLinksNext } from "../../../building-blocks/common/follow-links-next.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

/**
 * Test: System Users By SystemId (vendor) + pagination.
 *
 * Ensures that paginated access to system users by systemId (vendor endpoint) works correctly through APIM.
 */
export default function () {
    // Constants for now, could be replaced, but this works in at22 and tt02.
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

    const systemUserApiClient = new SystemUserApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/vendor/bysystem/${systemId}?token=`;

    describe("Get system users by systemId (vendor) + pagination", () => {
        const firstRes = systemUserApiClient.GetSystemUsersBySystemIdForVendor(systemId);
        expect(firstRes.status, "first page status").to.equal(200);
        const firstBody = firstRes.json();

        if (firstBody && firstBody.links && firstBody.links.next) {
            followLinksNext({
                firstBody,
                expectedNextBaseUrl,
                fetchByUrl: (url) => systemUserApiClient.GetSystemUsersByNextUrl(url),
                pageLabel: "page",
            });
        }
    });
}

