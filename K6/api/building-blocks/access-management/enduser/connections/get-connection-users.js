import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/access-management/enduser/connections/index.js";

/**
 * Retrieves users connected to a party.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetConnectionUsersQuery|null} [queryParams]
 * Query parameters. Use {@link GetConnectionUsersQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {SimplifiedConnectionDtoPaginatedResult|null} Paginated connection users result.
 */
export function GetConnectionUsers(
    connectionsClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = connectionsClient.GetConnectionUsers(
        queryParams,
        headers,
        labels,
    );

    /** @type {SimplifiedConnectionDtoPaginatedResult|null} */
    let connections = null;

    const succeed = check(res, {
        "GetConnectionUsers - status code is 200": (r) =>
            r.status === 200,
        "GetConnectionUsers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return connections;
    }

    check(res, {
        "GetConnectionUsers - body is valid": (r) => {
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
