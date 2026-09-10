import { check } from "k6";

import { GetResourcesQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { ResourcePermissionDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets resource permissions.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link GetResourcesQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
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
    const res = withRetries(
        () => connectionsClient.GetResources(
            queryParams,
            headers,
            labels,
        ),
        "GetResources",
    );

    /** @type {Array<ResourcePermissionDto>|null} */
    let resources = null;

    const succeed = check(res, {
        "GetResources - status code is 200": (r) =>
            r.status === 200,
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
