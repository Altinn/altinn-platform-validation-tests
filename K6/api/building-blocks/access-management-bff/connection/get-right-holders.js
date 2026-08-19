import { check } from "k6";

import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the connections a party has as right holder or reportee.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {GetRightHoldersQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRightHoldersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The connections. The API does not publish a schema
 * for this response.
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

    /** @type {object|null} */
    let connections = null;

    const succeed = check(res, {
        "GetRightHolders - status code is 200": (r) =>
            r.status === 200,
        "GetRightHolders - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
