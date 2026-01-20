import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { followLinksNext } from "../../../building-blocks/common/follow-links-next.js";
import { GetSystemUsersBySystemId, GetSystemUsersByUrl } from "../../../building-blocks/authentication/system-user/index.js";
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
        "altinn:authentication/systemregister.write"
    );
    vendorTokenOptions.set("orgNo", systemOwnerOrgNo);
    const vendorTokenGenerator = new EnterpriseTokenGenerator(vendorTokenOptions);

    const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/vendor/bysystem/${systemId}?token=`;

    const systemUserApiClient = new SystemUserApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    const firstBody = GetSystemUsersBySystemId(systemUserApiClient, systemId);

    const pages = followLinksNext({
        firstBody,
        expectedNextBaseUrl,
        fetchByUrl: (url) => GetSystemUsersByUrl(systemUserApiClient, url),
    });

    console.log("Counted Pages: " + pages);
    
}

