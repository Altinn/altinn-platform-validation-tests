import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Creates resource rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {CreateResourceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link CreateResourceRightsQueryBuilder}.
 * @param {RightKeyListDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True when the request succeeds.
 */
export function CreateResourceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = connectionsClient.CreateResourceRights(
        queryParams,
        body,
        labels,
    );

    const succeed = check(res, {
        "CreateResourceRights - status code is 201": (r) =>
            r.status === 201,
        "CreateResourceRights - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
