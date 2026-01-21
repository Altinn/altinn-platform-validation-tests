import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { VerifyNextLinkPagination } from "../../../building-blocks/common/follow-links-next.js";
import { GetSystemUsersBySystemId, GetSystemUsersByUrl } from "../../../building-blocks/authentication/system-user/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { check } from "k6";

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
        "altinn:authentication/systemregister.write"
    );
    vendorTokenOptions.set("orgNo", systemOwnerOrgNo);
    const vendorTokenGenerator = new EnterpriseTokenGenerator(vendorTokenOptions);

    const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/vendor/bysystem/${systemId}?token=`;

    const systemUserApiClient = new SystemUserApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    const firstBody = GetSystemUsersBySystemId(systemUserApiClient, systemId);

    const pages = VerifyNextLinkPagination({
        firstBody,
        expectedNextBaseUrl,
        fetchByUrl: (url) => GetSystemUsersByUrl(systemUserApiClient, url),
    });

    check(pages, {
        "Verify that Get System Users By System Id return paginated data": (p) => p > 1,
    });
    
}

