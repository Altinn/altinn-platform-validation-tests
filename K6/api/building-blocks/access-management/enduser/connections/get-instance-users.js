import { check } from "k6";

import { GetInstanceUsersQuery, SimplifiedPartyDtoPaginatedResult } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets users with access to an instance.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstanceUsersQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstanceUsersQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
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
    const res = withRetries(
        () => connectionsClient.GetInstanceUsers(
            queryParams,
            headers,
            labels,
        ),
        "GetInstanceUsers",
    );

    /** @type {SimplifiedPartyDtoPaginatedResult|null} */
    let instanceUsers = null;

    const succeed = check(res, {
        "GetInstanceUsers - status code is 200": (r) =>
            r.status === 200,
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
