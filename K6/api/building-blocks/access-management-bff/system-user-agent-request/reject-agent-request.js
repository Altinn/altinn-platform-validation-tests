import { check } from "k6";

import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";

/**
 * Rejects an agent system user request.
 *
 * @param {SystemUserAgentRequestClient} systemUserAgentRequestClient Client
 * for the agent system user request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} agentRequestId Agent request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent request was rejected.
 */
export function RejectAgentRequest(
    systemUserAgentRequestClient,
    partyId,
    agentRequestId,
    labels = null,
) {
    const res = systemUserAgentRequestClient.RejectAgentRequest(
        partyId,
        agentRequestId,
        labels,
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectAgentRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectAgentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rejected;
    }

    rejected = true;

    return rejected;
}
