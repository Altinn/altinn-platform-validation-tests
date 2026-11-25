import { check } from "k6";

import { withRetries } from "./retry.js";

/**
 * Sends a request that is expected to be refused, and checks that it was.
 *
 * The other building blocks check for a successful status and treat anything
 * else as a failure, which is the wrong way round for a test whose point is a
 * refusal. This is the building block for those: it checks that the response
 * carries the expected status and a problem details body, and hands the body
 * back for a domain check to read the error code off.
 *
 * Shared rather than one per operation, since every refusal looks the same from
 * here: a status code and a problem details body. The operation is passed in
 * and named in the checks, so each operation still gets checks of its own.
 *
 * The parsed body is returned whatever the status, so a test can undo a
 * request that was wrongly accepted: a 2xx comes back as whatever the API
 * created, with its id.
 *
 * @param {() => import("k6/http").RefinedResponse<"text">} sendRequest Calls the client.
 * @param {string} operation Name of the client operation, used in the check names.
 * @param {number} expectedStatus The status the refusal should have, e.g. 400.
 * @returns {*} The parsed body, or null when it could not be parsed.
 */
export function ExpectProblem(sendRequest, operation, expectedStatus) {
    const res = withRetries(sendRequest, operation);

    /** @type {*} */
    let body = null;

    try {
        body = JSON.parse(String(res.body));
    } catch (error) {
        // Left null: the body check below fails and the body is logged.
    }

    const success = check(res, {
        [`${operation} - status code is ${expectedStatus}`]: (r) => r.status === expectedStatus,
        [`${operation} - body is problem details`]: () => typeof body?.code === "string",
    });

    if (!success) {
        console.error(`${operation} - expected ${expectedStatus} with problem details, got ${res.status}: ${res.body}`);
    }

    return body;
}
