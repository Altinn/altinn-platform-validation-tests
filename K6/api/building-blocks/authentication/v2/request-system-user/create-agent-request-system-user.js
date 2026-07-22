import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/request-system-user/index.js";

/**
 * Creates a new agent system user request.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {CreateAgentRequestSystemUser} request Request model.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentRequestSystemResponse|null} Agent request response.
 */
export function CreateAgentRequestSystemUser(
    requestSystemUserClient,
    request,
    labels = null,
) {
    const res = requestSystemUserClient.CreateAgentRequestSystemUser(
        request,
        labels,
    );

    /** @type {AgentRequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "CreateAgentRequestSystemUser - status code is 200": (r) =>
            r.status === 200,
        "CreateAgentRequestSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "CreateAgentRequestSystemUser - body is valid": (r) => {
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
