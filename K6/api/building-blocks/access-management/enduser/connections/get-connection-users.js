import { check } from "k6";

import { GetConnectionUsersQuery, SimplifiedConnectionDtoPaginatedResult } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves users connected to a party.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetConnectionUsersQuery|null} [queryParams]
 * Query parameters. Use {@link GetConnectionUsersQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {SimplifiedConnectionDtoPaginatedResult|null} Paginated connection users result.
 */
export function GetConnectionUsers(
    connectionsClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.GetConnectionUsers(
            queryParams,
            headers,
            labels,
        ),
        "GetConnectionUsers",
    );

    /** @type {SimplifiedConnectionDtoPaginatedResult|null} */
    let connections = null;

    const succeed = check(res, {
        "GetConnectionUsers - status code is 200": (r) =>
            r.status === 200,
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
