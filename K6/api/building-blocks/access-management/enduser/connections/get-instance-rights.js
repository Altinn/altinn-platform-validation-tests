import { check } from "k6";

import { ConnectionsClient } from "../../../../../../clients/connections/index.js";

/**
 * Gets instance rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstanceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstanceRightsQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
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
    const res = connectionsClient.GetInstanceRights(
        queryParams,
        headers,
        labels,
    );

    /** @type {ExtInstanceRightDto|null} */
    let instanceRights = null;

    const succeed = check(res, {
        "GetInstanceRights - status code is 200": (r) =>
            r.status === 200,
        "GetInstanceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
