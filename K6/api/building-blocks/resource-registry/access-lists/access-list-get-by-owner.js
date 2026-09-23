import { check } from "k6";
import http from "k6/http";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListGetByOwnerQuery, AccessListInfoDtoPaginated } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all access lists for a resource owner.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {AccessListGetByOwnerQuery|null} [query] Optional query parameters.
 * @param {{expectedStatus?: number}|null} [options] The status the call has to answer with, for a
 * listing that should be refused, for example 403 for another owner's lists. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessListInfoDtoPaginated|null} Paginated access lists.
 */
export function AccessListGetByOwner(
    accessListClient,
    owner,
    query = null,
    options = null,
    labels = null,
) {
    const expectedStatus = options?.expectedStatus ?? 200;
    const res = expecting(expectedStatus, () => withRetries(
        () => accessListClient.AccessListGetByOwner(owner, query, labels),
        "AccessListGetByOwner",
    ));

    /** @type {AccessListInfoDtoPaginated|null} */
    let accessLists = null;

    const succeed = check(res, {
        [`AccessListGetByOwner - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed || expectedStatus !== 200) {
        if (!succeed) {
            console.log(res.status);
            console.log(res.body);
        }

        return accessLists;
    }

    check(res, {
        "AccessListGetByOwner - body is valid": (r) => {
            try {
                accessLists = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessLists;
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
