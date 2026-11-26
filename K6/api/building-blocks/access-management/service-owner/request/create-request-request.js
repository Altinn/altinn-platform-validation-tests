import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/service-owner/request/index.js";
import { RequestDto, RequestResourceDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { AltinnProblemDetails } from "../../../../../clients/common/problem-details.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a resource delegation request.
 *
 * @overload
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {RequestResourceDto} request Request payload.
 * @param {202} [expectedStatus] Status the caller expects. Defaults to 202.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
/**
 * Tries to create a resource delegation request, expecting a refusal.
 *
 * @overload
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {RequestResourceDto} request Request payload.
 * @param {number} expectedStatus The error status the caller expects, e.g. 400.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AltinnProblemDetails|null} The problem details the API answered with.
 */
/**
 * Creates a resource delegation request.
 *
 * A caller that expects a refusal passes that status, so a 400 the test asked
 * for reads as a pass, and gets the problem details back instead of the
 * request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {RequestResourceDto} request Request payload.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 202.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestDto|AltinnProblemDetails|null} The request, or the problem details for an expected refusal.
 */
export function RequestCreateResourceRequest(
    requestClient,
    request,
    expectedStatus = 202,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RequestCreateResourceRequest(
            request,
            labels,
        ),
        "RequestCreateResourceRequest",
    );

    /** @type {*} */
    let body = null;

    const succeed = check(res, {
        [`RequestCreateResourceRequest - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return body;
    }

    check(res, {
        "RequestCreateResourceRequest - body is valid": (r) => {
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
