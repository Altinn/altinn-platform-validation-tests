import { check } from "k6";

import { SimplifiedConnection } from "../../../../clients/access-management-bff/common/common.types.js";
import { GetSimplifiedConnectionsQuery } from "../../../../clients/access-management-bff/connection/connection.types.js";
import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the connections of a party in a simplified form.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {GetSimplifiedConnectionsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetSimplifiedConnectionsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<SimplifiedConnection>|null} The simplified connections.
 */
export function GetSimplifiedConnections(
    connectionClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionClient.GetSimplifiedConnections(queryParams, labels),
        "GetSimplifiedConnections",
    );

    /** @type {Array<SimplifiedConnection>|null} */
    let connections = null;

    const succeed = check(res, {
        "GetSimplifiedConnections - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return connections;
    }

    check(res, {
        "GetSimplifiedConnections - body is valid": (r) => {
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
