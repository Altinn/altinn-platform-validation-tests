import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Checks instance delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstanceDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstanceDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {InstanceCheckDto|null} Instance delegation check.
 */
export function GetInstanceDelegationCheck(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.GetInstanceDelegationCheck(
        queryParams,
        labels,
    );

    /** @type {InstanceCheckDto|null} */
    let instanceCheck = null;

    const succeed = check(res, {
        "GetInstanceDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instanceCheck;
    }

    check(res, {
        "GetInstanceDelegationCheck - body is valid": (r) => {
            try {
                instanceCheck = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instanceCheck;
}
