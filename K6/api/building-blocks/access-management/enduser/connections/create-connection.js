import { check } from "k6";

import { CreateConnectionQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { AssignmentDto, PersonInput } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a connection.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {CreateConnectionQuery|null} [queryParams]
 * Query parameters. Use {@link CreateConnectionQueryBuilder}.
 * @param {PersonInput|null} [body]
 * Request body.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {AssignmentDto|null} Created assignment.
 */
export function CreateConnection(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.CreateConnection(
            queryParams,
            body,
            labels,
        ),
        "CreateConnection",
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateConnection - status code is 200": (r) =>
            r.status === 200,
        "CreateConnection - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateConnection - body is valid": (r) => {
            try {
                assignment = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignment;
}
