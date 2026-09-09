import { check } from "k6";

import { CreateResourceRightsQuery, RightKeyListDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates resource rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {CreateResourceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link CreateResourceRightsQueryBuilder}.
 * @param {RightKeyListDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True when the request succeeds.
 */
export function CreateResourceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.CreateResourceRights(
            queryParams,
            body,
            labels,
        ),
        "CreateResourceRights",
    );

    const succeed = check(res, {
        "CreateResourceRights - status code is 201": (r) =>
            r.status === 201,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
