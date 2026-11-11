import { sentTraceparent } from "./retry.js";

/**
 * Logs a request that did not get the answer its building block expected: the
 * method and URL, the body that was sent, the status and body that came back,
 * and the traceparent when the run set one.
 *
 * The status and response body alone say that the call failed; the request body
 * says why, which is what a reviewer of a new test needs first. The bearer
 * token is not logged.
 *
 * @param {import("k6/http").RefinedResponse<"text">} res The response to the failed request.
 * @param {string} operation Name of the building block, used as the log prefix.
 * @returns {void}
 */
export function logFailedRequest(res, operation) {
    const request = res.request;
    const traceparent = sentTraceparent(res);

    console.error(`${operation} - ${request?.method ?? "?"} ${request?.url ?? res.url} answered ${res.status}`);
    console.error(`${operation} - request body: ${request?.body || "<none>"}`);
    console.error(`${operation} - response body: ${res.body || "<empty>"}`);

    if (traceparent !== null) {
        console.error(`${operation} - traceparent: ${traceparent}`);
    }
}
