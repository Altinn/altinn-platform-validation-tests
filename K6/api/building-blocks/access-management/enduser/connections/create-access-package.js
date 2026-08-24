import { check } from "k6";

import { CreateAccessPackageQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { AssignmentPackageDto } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { PersonInput } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates an access package assignment.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {CreateAccessPackageQuery|null} [queryParams]
 * Query parameters. Use {@link CreateAccessPackageQueryBuilder}.
 * @param {PersonInput|null} [body]
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {AssignmentPackageDto|null} Created access package assignment.
 */
export function CreateAccessPackage(
    connectionsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.CreateAccessPackage(
            queryParams,
            body,
            labels,
        ),
        "CreateAccessPackage",
    );

    /** @type {AssignmentPackageDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateAccessPackage - status code is 200": (r) =>
            r.status === 200,
        "CreateAccessPackage - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateAccessPackage - body is valid": (r) => {
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
