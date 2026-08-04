import { check } from "k6";

import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";

/**
 * Gets an agent system user request.
 *
 * @param {SystemUserAgentRequestClient} systemUserAgentRequestClient Client
 * for the agent system user request endpoints.
 * @param {string} agentRequestId Agent request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The agent request. The API does not publish a schema
 * for this response.
 */
export function GetAgentRequest(
    systemUserAgentRequestClient,
    agentRequestId,
    labels = null,
) {
    const res = systemUserAgentRequestClient.GetAgentRequest(
        agentRequestId,
        labels,
    );

    /** @type {object|null} */
    let agentRequest = null;

    const succeed = check(res, {
        "GetAgentRequest - status code is 200": (r) =>
            r.status === 200,
        "GetAgentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return agentRequest;
    }

    check(res, {
        "GetAgentRequest - body is valid": (r) => {
            try {
                agentRequest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return agentRequest;
}
