import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Gets resource permissions.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link GetResourcesQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {Array<ResourcePermissionDto>|null} Retrieved resource permissions.
 */
export function GetResources(
    connectionsClient,
    queryParams = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const res = connectionsClient.GetResources(
        queryParams,
        headers,
        labels,
    );

    /** @type {Array<ResourcePermissionDto>|null} */
    let resources = null;

    const succeed = check(res, {
        "GetResources - status code is 200": (r) =>
            r.status === 200,
        "GetResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
