import { check } from "k6";

import { AssignmentResourceDto, ServiceOwnerResourceDelegation } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a service owner resource delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerResourceDelegation} request Delegation payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentResourceDto|null} Created assignment resource.
 */
export function ConnectionsCreateResource(
    connectionsClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsCreateResource(request, labels),
        "ConnectionsCreateResource",
    );

    /** @type {AssignmentResourceDto|null} */
    let assignmentResource = null;

    const succeed = check(res, {
        "ConnectionsCreateResource - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignmentResource;
    }

    check(res, {
        "ConnectionsCreateResource - body is valid": (r) => {
            try {
                assignmentResource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignmentResource;
}
