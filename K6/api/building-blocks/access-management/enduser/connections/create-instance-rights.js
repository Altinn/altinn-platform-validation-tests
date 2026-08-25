import { check } from "k6";

import { CreateInstanceRightsQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { InstanceRightsDelegationDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

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
    const res = withRetries(
        () => connectionsClient.CreateInstanceRights(
            queryParams,
            body,
            labels,
        ),
        "CreateInstanceRights",
    );

    return check(res, {
        "CreateInstanceRights - status code is 201": (r) =>
            r.status === 201,
        "CreateInstanceRights - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });
}
