import { check } from "k6";

import { ExtInstanceRightDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { GetInstanceRightsQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets instance rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstanceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstanceRightsQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {ExtInstanceRightDto|null} Instance rights.
 */
export function GetInstanceRights(
    connectionsClient,
    queryParams = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.GetInstanceRights(
            queryParams,
            headers,
            labels,
        ),
        "GetInstanceRights",
    );

    /** @type {ExtInstanceRightDto|null} */
    let instanceRights = null;

    const succeed = check(res, {
        "GetInstanceRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instanceRights;
    }

    check(res, {
        "GetInstanceRights - body is valid": (r) => {
            try {
                instanceRights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instanceRights;
}
