import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Updates resource rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {UpdateResourceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link UpdateResourceRightsQueryBuilder}.
 * @param {RightKeyListDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True when the request succeeds.
 */
export function UpdateResourceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = connectionsClient.UpdateResourceRights(
        queryParams,
        body,
        labels,
    );

    const succeed = check(res, {
        "UpdateResourceRights - status code is 200": (r) =>
            r.status === 200,
        "UpdateResourceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
