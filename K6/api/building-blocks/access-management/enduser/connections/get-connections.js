import { check } from "k6";

import { ConnectionDtoPaginatedResult, GetConnectionsQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves connections for a party.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetConnectionsQuery|null} [queryParams]
 * Query parameters. Use {@link GetConnectionsQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {ConnectionDtoPaginatedResult|null} Paginated connections result.
 */
export function GetConnections(
    connectionsClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.GetConnections(
            queryParams,
            headers,
            labels,
        ),
        "GetConnections",
    );

    /** @type {ConnectionDtoPaginatedResult|null} */
    let connections = null;

    const succeed = check(res, {
        "GetConnections - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return connections;
    }

    check(res, {
        "GetConnections - body is valid": (r) => {
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
