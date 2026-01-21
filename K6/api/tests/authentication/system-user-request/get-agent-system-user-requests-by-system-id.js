import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { followLinksNext } from "../../../building-blocks/common/follow-links-next.js";
import { GetAgentSystemUserRequestsBySystemId, GetSystemUserRequestsByUrl } from "../../../building-blocks/authentication/system-user-request/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

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
        "altinn:authentication/systemuser.request.read"
    );
    vendorTokenOptions.set("orgNo", systemOwnerOrgNo);
    const vendorTokenGenerator = new EnterpriseTokenGenerator(vendorTokenOptions);

    const systemUserRequestApiClient = new SystemUserRequestApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/request/vendor/agent/bysystem/${systemId}?token=`;

    const firstBody = GetAgentSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId);

    followLinksNext({
        firstBody,
        expectedNextBaseUrl,
        fetchByUrl: (url) => GetSystemUserRequestsByUrl(systemUserRequestApiClient, url),
    });

}
