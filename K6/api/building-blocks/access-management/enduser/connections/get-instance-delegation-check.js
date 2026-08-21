import { check } from "k6";

import { InstanceCheckDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { GetInstanceDelegationCheckQuery } from "../../../../../clients/access-management-bff/instance/instance.types.js";
import { withRetries } from "../../../common/retry.js";

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
    const res = withRetries(
        () => connectionsClient.GetInstanceDelegationCheck(
            queryParams,
            labels,
        ),
        "GetInstanceDelegationCheck",
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
