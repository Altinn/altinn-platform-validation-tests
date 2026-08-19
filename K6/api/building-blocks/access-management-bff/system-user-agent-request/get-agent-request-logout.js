import { check } from "k6";

import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the logout redirect for an agent system user request.
 *
 * @param {SystemUserAgentRequestClient} systemUserAgentRequestClient Client
 * for the agent system user request endpoints.
 * @param {string} agentRequestId Agent request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse} The raw response, holding the redirect
 * target.
 */
export function GetAgentRequestLogout(
    systemUserAgentRequestClient,
    agentRequestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentRequestClient.GetAgentRequestLogout(
            agentRequestId,
            labels,
        ),
        "GetAgentRequestLogout",
    );

    const succeed = check(res, {
        "GetAgentRequestLogout - status code is 200": (r) =>
            r.status === 200,
        "GetAgentRequestLogout - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
