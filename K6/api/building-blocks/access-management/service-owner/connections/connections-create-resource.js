import { check } from "k6";

import { AssignmentResourceDto, ServiceOwnerResourceDelegation } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { AltinnProblemDetails } from "../../../../../clients/common/problem-details.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a service owner resource delegation.
 *
 * @overload
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerResourceDelegation} request Delegation payload.
 * @param {200} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentResourceDto|null} Created assignment resource.
 */
/**
 * Tries to create a service owner resource delegation, expecting a refusal.
 *
 * @overload
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerResourceDelegation} request Delegation payload.
 * @param {number} expectedStatus The error status the caller expects, e.g. 400.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AltinnProblemDetails|null} The problem details the API answered with.
 */
/**
 * Creates a service owner resource delegation.
 *
 * A caller that expects a refusal passes that status, so a 400 the test asked
 * for reads as a pass, and gets the problem details back instead of the
 * assignment.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerResourceDelegation} request Delegation payload.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentResourceDto|AltinnProblemDetails|null} The assignment, or the problem details for an expected refusal.
 */
export function ConnectionsCreateResource(
    connectionsClient,
    request,
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsCreateResource(request, labels),
        "ConnectionsCreateResource",
    );

    /** @type {*} */
    let body = null;

    const succeed = check(res, {
        [`ConnectionsCreateResource - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return body;
    }

    check(res, {
        "ConnectionsCreateResource - body is valid": (r) => {
            try {
                body = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return body;
}
