import { check } from "k6";

import { AssignmentPackageDto, ServiceOwnerAccessPackageDelegation } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a service owner access package delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentPackageDto|null} Created assignment package.
 */
export function ConnectionsCreateAccessPackage(
    connectionsClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsCreateAccessPackage(
            request,
            labels,
        ),
        "ConnectionsCreateAccessPackage",
    );

    /** @type {AssignmentPackageDto|null} */
    let assignmentPackage = null;

    const succeed = check(res, {
        "ConnectionsCreateAccessPackage - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignmentPackage;
    }

    check(res, {
        "ConnectionsCreateAccessPackage - body is valid": (r) => {
            try {
                assignmentPackage = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignmentPackage;
}
