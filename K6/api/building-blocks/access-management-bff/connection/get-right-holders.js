import { check } from "k6";

import { ConnectionFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { GetRightHoldersQuery } from "../../../../clients/access-management-bff/connection/connection.types.js";
import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the connections a party has as right holder or reportee.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {GetRightHoldersQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRightHoldersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ConnectionFE>|null} The connections.
 */
export function GetRightHolders(
    connectionClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionClient.GetRightHolders(queryParams, labels),
        "GetRightHolders",
    );

    /** @type {Array<ConnectionFE>|null} */
    let connections = null;

    const succeed = check(res, {
        "GetRightHolders - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return connections;
    }

    check(res, {
        "GetRightHolders - body is valid": (r) => {
            try {
                connections = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return connections;
}
