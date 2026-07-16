import { check } from "k6";

import { ConnectionsClient } from "../../../../../../clients/connections/index.js";

/**
 * Creates instance rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {CreateInstanceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link CreateInstanceRightsQueryBuilder}.
 * @param {InstanceRightsDelegationDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if creation succeeded.
 */
export function CreateInstanceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = connectionsClient.CreateInstanceRights(
        queryParams,
        body,
        labels,
    );

    return check(res, {
        "CreateInstanceRights - status code is 201": (r) =>
            r.status === 201,
        "CreateInstanceRights - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });
}
