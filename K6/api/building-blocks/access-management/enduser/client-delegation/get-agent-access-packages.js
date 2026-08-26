import { check } from "k6";

import { AgentAccessPackagesQuery, ClientDtoPaginatedResult } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the access packages delegated to an agent.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {AgentAccessPackagesQuery} queryParams
 * Query parameters. Use {@link AgentAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ClientDtoPaginatedResult|null} Paginated access packages result.
 */
export function GetAgentAccessPackages(
    clientDelegationClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetAgentAccessPackages(
            queryParams,
            labels,
        ),
        "GetAgentAccessPackages",
    );

    /** @type {ClientDtoPaginatedResult|null} */
    let accessPackages = null;

    const succeed = check(res, {
        "GetAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "GetAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackages;
    }

    check(res, {
        "GetAgentAccessPackages - body is valid": (r) => {
            try {
                accessPackages = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessPackages;
}
