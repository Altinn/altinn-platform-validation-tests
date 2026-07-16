import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Checks resource delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link GetResourceDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {ResourceCheckDto|null} Resource delegation check result.
 */
export function GetResourceDelegationCheck(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.GetResourceDelegationCheck(
        queryParams,
        labels,
    );

    /** @type {ResourceCheckDto|null} */
    let resourceCheck = null;

    const succeed = check(res, {
        "GetResourceDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetResourceDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceCheck;
    }

    check(res, {
        "GetResourceDelegationCheck - body is valid": (r) => {
            try {
                resourceCheck = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceCheck;
}
