import { check } from "k6";

import { AgentDtoPaginatedResult } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the client providers the authenticated party is a client of.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentDtoPaginatedResult|null} Paginated client providers result.
 */
export function GetMyClientProviders(
    clientDelegationClient,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetMyClientProviders(
            labels,
        ),
        "GetMyClientProviders",
    );

    /** @type {AgentDtoPaginatedResult|null} */
    let providers = null;

    const succeed = check(res, {
        "GetMyClientProviders - status code is 200": (r) =>
            r.status === 200,
        "GetMyClientProviders - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return providers;
    }

    check(res, {
        "GetMyClientProviders - body is valid": (r) => {
            try {
                providers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return providers;
}
