import { check } from "k6";

import { SystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Escalates an agent system user request to someone who can approve it.
 *
 * @param {SystemUserAgentRequestClient} systemUserAgentRequestClient Client
 * for the agent system user request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} requestId Agent request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent request was escalated.
 */
export function EscalateAgentRequest(
    systemUserAgentRequestClient,
    partyId,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentRequestClient.EscalateAgentRequest(
            partyId,
            requestId,
            labels,
        ),
        "EscalateAgentRequest",
    );

    let escalated = false;

    const succeed = check(res, {
        "EscalateAgentRequest - status code is 200": (r) =>
            r.status === 200,
        "EscalateAgentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return escalated;
    }

    escalated = true;

    return escalated;
}
