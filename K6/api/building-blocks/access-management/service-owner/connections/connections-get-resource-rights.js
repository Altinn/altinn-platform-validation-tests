import { check } from "k6";

import { GetResourceRightsQuery, RightDto } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets the rights available for a resource.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceRightsQuery|null} [query] Resource rights query.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<RightDto>} Available resource rights.
 */
export function ConnectionsGetResourceRights(
    connectionsClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsGetResourceRights(query, labels),
        "ConnectionsGetResourceRights",
    );

    /** @type {Array<RightDto>} */
    let rights = [];

    const succeed = check(res, {
        "ConnectionsGetResourceRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rights;
    }

    check(res, {
        "ConnectionsGetResourceRights - body is valid": (r) => {
            try {
                rights = JSON.parse(r.body);

                return Array.isArray(rights);
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rights;
}
