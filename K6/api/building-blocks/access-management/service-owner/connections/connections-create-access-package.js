import { check } from "k6";

import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a service owner access package delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
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
        "ConnectionsCreateAccessPackage - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
