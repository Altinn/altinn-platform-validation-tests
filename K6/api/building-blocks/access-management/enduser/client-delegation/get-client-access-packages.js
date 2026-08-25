import { check } from "k6";

import { AgentDtoPaginatedResult, ClientAccessPackagesQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the access packages held on a client.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {ClientAccessPackagesQuery} queryParams
 * Query parameters. Use {@link ClientAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AgentDtoPaginatedResult|null} Paginated access packages result.
 */
export function GetClientAccessPackages(
    clientDelegationClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetClientAccessPackages(
            queryParams,
            labels,
        ),
        "GetClientAccessPackages",
    );

    /** @type {AgentDtoPaginatedResult|null} */
    let accessPackages = null;

    const succeed = check(res, {
        "GetClientAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "GetClientAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackages;
    }

    check(res, {
        "GetClientAccessPackages - body is valid": (r) => {
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
