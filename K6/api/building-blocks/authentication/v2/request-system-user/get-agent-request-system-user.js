import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/request-system-user/index.js";

/**
 * Retrieves an agent system user request by id.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentRequestSystemResponse|null} Agent request response.
 */
export function GetAgentRequestSystemUser(
    requestSystemUserClient,
    requestId,
    labels = null,
) {
    const res = requestSystemUserClient.GetAgentRequestSystemUser(
        requestId,
        labels,
    );

    /** @type {AgentRequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "GetAgentRequestSystemUser - status code is 200": (r) =>
            r.status === 200,
        "GetAgentRequestSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "GetAgentRequestSystemUser - body is valid": (r) => {
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
