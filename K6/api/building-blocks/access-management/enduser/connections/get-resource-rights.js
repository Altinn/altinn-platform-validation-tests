import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Gets resource rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link GetResourceRightsQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {ExternalResourceRightDto|null} Resource rights.
 */
export function GetResourceRights(
    connectionsClient,
    queryParams = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const res = connectionsClient.GetResourceRights(
        queryParams,
        headers,
        labels,
    );

    /** @type {ExternalResourceRightDto|null} */
    let resourceRights = null;

    const succeed = check(res, {
        "GetResourceRights - status code is 200": (r) =>
            r.status === 200,
        "GetResourceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceRights;
    }

    check(res, {
        "GetResourceRights - body is valid": (r) => {
            try {
                resourceRights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceRights;
}
