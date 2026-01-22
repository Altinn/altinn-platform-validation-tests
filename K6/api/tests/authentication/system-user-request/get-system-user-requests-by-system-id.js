
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { VerifyNextLinkPagination } from "../../../building-blocks/common/follow-links-next.js";
import {
    GetSystemUserRequestsBySystemId, 
    GetSystemUserRequestsByUrl
} from "../../../building-blocks/authentication/system-user-request/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { check } from "k6";
import { fail } from "k6";


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

    const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/request/vendor/bysystem/${systemId}?token=`;

    const firstBody = GetSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId);

    if (firstBody === null) {
        fail("Expected to find system user requests, but found none");
    }

    const pages = VerifyNextLinkPagination({
        firstBody,
        expectedNextBaseUrl,
        fetchByUrl: (url) => GetSystemUserRequestsByUrl(systemUserRequestApiClient, url),
    });

    var passed = check(pages, {
        "Verify that System User Requests return paginated data": (p) => p > 1,
    });

    if (!passed) {
        console.log("Expected to find more than 1 page");
    }
}
