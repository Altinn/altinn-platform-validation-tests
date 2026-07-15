import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Retrieves connections for a party.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetConnectionsQuery|null} [queryParams]
 * Query parameters. Use {@link GetConnectionsQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {ConnectionDtoPaginatedResult|null} Paginated connections result.
 */
export function GetConnections(
    connectionsClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = connectionsClient.GetConnections(
        queryParams,
        headers,
        labels,
    );

    /** @type {ConnectionDtoPaginatedResult|null} */
    let connections = null;

    const succeed = check(res, {
        "GetConnections - status code is 200": (r) =>
            r.status === 200,
        "GetConnections - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
