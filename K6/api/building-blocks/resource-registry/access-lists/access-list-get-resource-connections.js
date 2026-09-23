import { check } from "k6";
import http from "k6/http";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListPagedQuery, AccessListResourceConnectionDtoAggregateVersionVersionedPaginated } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resource connections of an access list.
 *
 * A versioned operation: the response carries the list's version as an ETag,
 * and `options` can condition the call on one (`If-Match`, `If-None-Match`,
 * as declared on this operation in the swagger) and say what status that
 * should produce, 304 when nothing changed or 412 when the precondition
 * failed. Without options this is a plain call that expects 200. The expected
 * status is marked as expected for this one call, so a 412 a test asks for
 * does not count as a failed request.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {AccessListPagedQuery|null} [query] Optional query parameters.
 * @param {{headers?: {[key: string]: string}|null, expectedStatus?: number}|null} [options]
 * Conditional request headers and the status the call has to answer with. Defaults to no headers and 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {{value: AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null, etag: string|null, status: number}} Resource connections as `value`
 * when the response had a body, the ETag header of the response, and the status it answered with.
 */
export function AccessListsGetResourceConnections(
    accessListClient,
    owner,
    identifier,
    query = null,
    options = null,
    labels = null,
) {
    const expectedStatus = options?.expectedStatus ?? 200;
    const res = expecting(expectedStatus, () => withRetries(
        () => accessListClient.AccessListGetResourceConnections(owner, identifier, query, options?.headers ?? {}, labels),
        "AccessListsGetResourceConnections",
    ));

    /** @type {AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null} */
    let connections = null;
    const etag = res.headers["Etag"] ?? res.headers["ETag"] ?? null;

    const succeed = check(res, {
        [`AccessListsGetResourceConnections - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return { value: connections, etag, status: res.status };
    }

    // 304 and 412 carry no body; only a 200 has something to parse.
    if (res.status === 200) {
        check(res, {
            "AccessListsGetResourceConnections - body is valid": (r) => {
                try {
                    connections = JSON.parse(r.body);

                    return true;
                } catch (err) {
                    console.log("Unable to parse response body");
                    console.log(r.body);

                    return false;
                }
            },
        });
    }

    return { value: connections, etag, status: res.status };
}

/**
 * Runs one call whose expected answer may be an error status, without k6
 * counting that answer as a failed request.
 *
 * k6 counts every 4xx and 5xx towards `http_req_failed`, which the strict
 * options hold at zero, so the one call that is meant to get a 412 has to say
 * so. The default expectation is restored afterwards, so nothing else in the
 * iteration inherits it.
 *
 * @template T
 * @param {number} status The status the call is expected to answer with.
 * @param {() => T} call The call.
 * @returns {T} What the call returned.
 */
function expecting(status, call) {
    http.setResponseCallback(http.expectedStatuses(status));

    try {
        return call();
    } finally {
        http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }));
    }
}
