import { check } from "k6";

import { GetResourceRightsQuery, RightDto } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { AltinnProblemDetails } from "../../../../../clients/common/problem-details.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets the rights available for a resource.
 *
 * @overload
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceRightsQuery|null} [query] Resource rights query.
 * @param {200} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<RightDto>} Available resource rights.
 */
/**
 * Asks for the rights on a resource, expecting a refusal.
 *
 * @overload
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceRightsQuery|null} query Resource rights query.
 * @param {number} expectedStatus The error status the caller expects, e.g. 400.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AltinnProblemDetails|null} The problem details the API answered with.
 */
/**
 * Gets the rights available for a resource.
 *
 * A caller that expects a refusal passes that status, so a 400 the test asked
 * for reads as a pass, and gets the problem details back instead of the
 * rights.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetResourceRightsQuery|null} [query] Resource rights query.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<RightDto>|AltinnProblemDetails|null} The rights, or the problem details for an expected refusal.
 */
export function ConnectionsGetResourceRights(
    connectionsClient,
    query = null,
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsGetResourceRights(query, labels),
        "ConnectionsGetResourceRights",
    );

    /** @type {*} */
    let body = expectedStatus === 200 ? [] : null;

    const succeed = check(res, {
        [`ConnectionsGetResourceRights - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return body;
    }

    check(res, {
        "ConnectionsGetResourceRights - body is valid": (r) => {
            try {
                body = JSON.parse(r.body);

                return expectedStatus === 200 ? Array.isArray(body) : typeof body?.code === "string";
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return body;
}
