import { check } from "k6";

import { GetResourceDelegationCheckQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { ResourceCheckDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Checks resource delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link GetResourceDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {ResourceCheckDto|null} Resource delegation check result.
 */
export function GetResourceDelegationCheck(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.GetResourceDelegationCheck(
            queryParams,
            labels,
        ),
        "GetResourceDelegationCheck",
    );

    /** @type {ResourceCheckDto|null} */
    let resourceCheck = null;

    const succeed = check(res, {
        "GetResourceDelegationCheck - status code is 200": (r) =>
            r.status === 200,
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
