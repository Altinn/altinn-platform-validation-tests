import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/request-system-user/index.js";

/**
 * Retrieves agent system user requests by system.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} systemId System identifier.
 * @param {GuidOpaque|null} [token] Continuation token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentRequestSystemResponsePaginated|null} Paginated agent request responses.
 */
export function GetAgentRequestSystemUsersBySystem(
    requestSystemUserClient,
    systemId,
    token = null,
    labels = null,
) {
    const res = requestSystemUserClient.GetAgentRequestSystemUsersBySystem(
        systemId,
        token,
        labels,
    );

    /** @type {AgentRequestSystemResponsePaginated|null} */
    let requestResponses = null;

    const succeed = check(res, {
        "GetAgentRequestSystemUsersBySystem - status code is 200": (r) =>
            r.status === 200,
        "GetAgentRequestSystemUsersBySystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponses;
    }

    check(res, {
        "GetAgentRequestSystemUsersBySystem - body is valid": (r) => {
            try {
                requestResponses = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponses;
}
