import { check } from "k6";

import { RequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a new agent system user request.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {CreateAgentRequestSystemUser} request Request model.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentRequestSystemResponse|null} Agent request response.
 */
export function RequestSystemUserVendorAgentCreate(
    requestSystemUserClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () =>
            requestSystemUserClient.RequestSystemUserVendorAgentCreate(
                request,
                labels,
            ),
        "RequestSystemUserVendorAgentCreate",
    );

    /** @type {AgentRequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "RequestSystemUserVendorAgentCreate - status code is 201": (r) =>
            r.status === 201,
        "RequestSystemUserVendorAgentCreate - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "RequestSystemUserVendorAgentCreate - body is valid": (r) => {
            try {
                requestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponse;
}
