import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Gets users with access to an instance.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstanceUsersQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstanceUsersQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {SimplifiedPartyDtoPaginatedResult|null} Instance users.
 */
export function GetInstanceUsers(
    connectionsClient,
    queryParams = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const res = connectionsClient.GetInstanceUsers(
        queryParams,
        headers,
        labels,
    );

    /** @type {SimplifiedPartyDtoPaginatedResult|null} */
    let instanceUsers = null;

    const succeed = check(res, {
        "GetInstanceUsers - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceUsers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instanceUsers;
    }

    check(res, {
        "GetInstanceUsers - body is valid": (r) => {
            try {
                instanceUsers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instanceUsers;
}
