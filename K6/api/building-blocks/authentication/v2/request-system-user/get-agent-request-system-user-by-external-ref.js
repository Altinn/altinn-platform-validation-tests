import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/request-system-user/index.js";

/**
 * Retrieves an agent system user request by external reference.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} systemId System identifier.
 * @param {string} orgNo Organization number.
 * @param {string} externalRef External reference.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentRequestSystemResponse|null} Agent request response.
 */
export function GetAgentRequestSystemUserByExternalRef(
    requestSystemUserClient,
    systemId,
    orgNo,
    externalRef,
    labels = null,
) {
    const res = requestSystemUserClient.GetAgentRequestSystemUserByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels,
    );

    /** @type {AgentRequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "GetAgentRequestSystemUserByExternalRef - status code is 200": (r) =>
            r.status === 200,
        "GetAgentRequestSystemUserByExternalRef - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "GetAgentRequestSystemUserByExternalRef - body is valid": (r) => {
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
