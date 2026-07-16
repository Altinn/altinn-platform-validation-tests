import { check } from "k6";

import { ConnectionsClient } from "../../../../../../clients/connections/index.js";

/**
 * Updates instance rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {UpdateInstanceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link UpdateInstanceRightsQueryBuilder}.
 * @param {RightKeyListDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if update succeeded.
 */
export function UpdateInstanceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = connectionsClient.UpdateInstanceRights(
        queryParams,
        body,
        labels,
    );

    return check(res, {
        "UpdateInstanceRights - status code is 200": (r) =>
            r.status === 200,
        "UpdateInstanceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
