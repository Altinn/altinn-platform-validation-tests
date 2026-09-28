import { check } from "k6";

import { RightKeyListDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { UpdateInstanceRightsQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Updates instance rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {UpdateInstanceRightsQuery|null} [queryParams]
 * Query parameters. Use {@link UpdateInstanceRightsQueryBuilder}.
 * @param {RightKeyListDto|null} [body]
 * Request body.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if update succeeded.
 */
export function UpdateInstanceRights(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.UpdateInstanceRights(
            queryParams,
            body,
            labels,
        ),
        "UpdateInstanceRights",
    );

    return check(res, {
        "UpdateInstanceRights - status code is 200": (r) =>
            r.status === 200,
    });
}
