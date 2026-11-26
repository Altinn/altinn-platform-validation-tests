import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { RequestDto, RequestedRightKeysDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { AltinnProblemDetails } from "../../../../../clients/common/problem-details.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a resource request.
 *
 * @overload
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} resource Resource identifier.
 * @param {RequestedRightKeysDto|null} [body] The right keys to request.
 * @param {200} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
/**
 * Tries to create a resource request, expecting a refusal.
 *
 * @overload
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} resource Resource identifier.
 * @param {RequestedRightKeysDto|null} body The right keys to request.
 * @param {number} expectedStatus The error status the caller expects, e.g. 400.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AltinnProblemDetails|null} The problem details the API answered with.
 */
/**
 * Creates a resource request.
 *
 * A caller that expects a refusal passes that status, so a 400 the test asked
 * for reads as a pass, and gets the problem details back instead of the
 * request.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} resource Resource identifier.
 * @param {RequestedRightKeysDto|null} [body] The right keys to request.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|AltinnProblemDetails|null} The request, or the problem details for an expected refusal.
 */
export function CreateResourceRequest(
    requestClient,
    party,
    to,
    resource,
    body = null,
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.CreateResourceRequest(
            party,
            to,
            resource,
            body,
            labels,
        ),
        "CreateResourceRequest",
    );

    /** @type {*} */
    let answer = null;

    const succeed = check(res, {
        [`CreateResourceRequest - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return answer;
    }

    check(res, {
        "CreateResourceRequest - body is valid": (r) => {
            try {
                answer = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return answer;
}
