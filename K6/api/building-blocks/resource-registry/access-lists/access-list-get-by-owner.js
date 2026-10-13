import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListGetByOwnerQuery, AccessListInfoDtoPaginated } from "../../../../clients/resource-registry/types.js";
import { withExpectedStatus, withRetries } from "../../common/retry.js";

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
    const res = withExpectedStatus(expectedStatus, () => withRetries(
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
