import { check } from "k6";

import { RequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";
import { withRetries } from "../../../common/retry.js";

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
export function RequestSystemUserVendorAgentGetByExternalRef(
    requestSystemUserClient,
    systemId,
    orgNo,
    externalRef,
    labels = null,
) {
    const res = withRetries(
        () =>
            requestSystemUserClient.RequestSystemUserVendorAgentGetByExternalRef(
                systemId,
                orgNo,
                externalRef,
                labels,
            ),
        "RequestSystemUserVendorAgentGetByExternalRef",
    );

    /** @type {AgentRequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "RequestSystemUserVendorAgentGetByExternalRef - status code is 200": (r) =>
            r.status === 200,
        "RequestSystemUserVendorAgentGetByExternalRef - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "RequestSystemUserVendorAgentGetByExternalRef - body is valid": (r) => {
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
