import { URL, uuidv4 } from "../../common-imports.js";

/**
 * Builds the URL of a request, with the query parameters appended.
 *
 * Skips parameters that are undefined or null, repeats the key for array
 * values, and sends everything else as a string, so 0, false and "" reach
 * the API rather than being dropped.
 *
 * @param {string} base The URL without query parameters.
 * @param {{[key: string]: *}|null} [query] Query parameters to append.
 * @returns {string} The URL with the query parameters appended.
 */
export function buildUrl(base, query = null) {
    if (query === null || query === undefined) {
        return base;
    }

    const url = new URL(base);

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                url.searchParams.append(key, String(item));
            }
        } else {
            url.searchParams.append(key, String(value));
        }
    }

    return url.toString();
}

/**
 * Builds the k6 tags of a request.
 *
 * The endpoint is tagged twice, as `endpoint` and as `name`, since the
 * dashboards read the first and k6 groups its metrics on the second. The
 * labels from the caller go first, so a caller cannot override the tags that
 * identify the request.
 *
 * @param {string} endpoint The endpoint the request goes to, with path
 * parameters left as `{placeholders}` so every call to it shares one tag.
 * @param {string} action The action tag of the client method.
 * @param {{[key: string]: string}|null} [labels] Optional labels from the caller.
 * @returns {{[key: string]: string}} The tags to send with the request.
 */
export function requestTags(endpoint, action, labels = null) {
    return {
        ...(labels ?? {}),
        endpoint,
        name: endpoint,
        action,
    };
}

/**
 * Builds a `traceparent` header value that starts a new trace.
 *
 * Follows the W3C Trace Context format, `00-<trace id>-<span id>-01`: version
 * 00, a 32 hex digit trace id, a 16 hex digit span id, and the sampled flag
 * set, so the service the request goes to can pick the trace up and continue
 * it. Both ids are drawn from UUIDs, which guarantees they are never all
 * zeros, the one value the format forbids.
 *
 * @returns {string} A traceparent header value for one request.
 */
export function traceparent() {
    const traceId = uuidv4().replace(/-/g, "");
    const spanId = uuidv4().replace(/-/g, "").slice(0, 16);

    return `00-${traceId}-${spanId}-01`;
}

/**
 * Builds the headers of a request.
 *
 * Adds a `traceparent` header when the run sets `TRACE_CALL`, so a request can
 * be found again in the logs of the service it went to. See
 * {@link traceparent} for the format.
 *
 * @param {string|null} token Bearer token, or null for an unauthenticated
 * request.
 * @param {{json?: boolean, accept?: string|null, headers?: {[key: string]: string}}} [options]
 * `json` adds a JSON `Content-Type`, `accept` overrides the `Accept` header
 * (null leaves it out), and `headers` are added as they are.
 * @returns {{[key: string]: string}} The headers to send with the request.
 */
export function requestHeaders(token, options = {}) {
    const { json = false, accept = "application/json", headers = {} } = options;

    /** @type {{[key: string]: string}} */
    const result = {};

    if (token !== null) {
        result.Authorization = `Bearer ${token}`;
    }

    if (accept !== null) {
        result.Accept = accept;
    }

    if (json) {
        result["Content-Type"] = "application/json";
    }

    Object.assign(result, headers);

    if (__ENV.TRACE_CALL) {
        result.traceparent = traceparent();
    }

    return result;
}

/**
 * Builds the k6 params of a request: its tags and headers, in one call.
 *
 * @param {{endpoint: string, action: string, labels?: {[key: string]: string}|null, token?: string|null, json?: boolean, accept?: string|null, headers?: {[key: string]: string}}} request
 * What to tag the request with and how to authenticate it. See
 * {@link requestTags} and {@link requestHeaders} for each field.
 * @returns {{tags: {[key: string]: string}, headers: {[key: string]: string}}}
 * The params to pass to the k6 http call.
 */
export function requestParams(request) {
    return {
        tags: requestTags(request.endpoint, request.action, request.labels ?? null),
        headers: requestHeaders(request.token ?? null, {
            json: request.json,
            accept: request.accept,
            headers: request.headers,
        }),
    };
}

/**
 * Serialises a request body as JSON, keeping a missing body as null so the
 * request is sent without one.
 *
 * @param {*} body The body to send, or null.
 * @returns {string|null} The JSON text, or null when there is no body.
 */
export function jsonBody(body) {
    return body === null || body === undefined ? null : JSON.stringify(body);
}
