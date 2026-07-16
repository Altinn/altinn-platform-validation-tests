import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Retrieves instance permissions.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetInstancesQuery|null} [queryParams]
 * Query parameters. Use {@link GetInstancesQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {Array<InstancePermissionDto>|null} Instance permissions.
 */
export function GetInstances(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.GetInstances(
        queryParams,
        labels,
    );

    /** @type {Array<InstancePermissionDto>|null} */
    let instances = null;

    const succeed = check(res, {
        "GetInstances - status code is 200": (r) =>
            r.status === 200,
        "GetInstances - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return instances;
    }

    check(res, {
        "GetInstances - body is valid": (r) => {
            try {
                instances = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instances;
}
