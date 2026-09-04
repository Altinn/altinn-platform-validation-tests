import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListPagedQuery, AccessListResourceConnectionDtoAggregateVersionVersionedPaginated } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all resource connections for an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {AccessListPagedQuery|null} [query] Optional query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null} Parsed response body, or null when the call failed.
 */
export function AccessListsGetResourceConnections(
    accessListClient,
    owner,
    identifier,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListGetResourceConnections(
            owner,
            identifier,
            query,
            labels,
        ),
        "AccessListsGetResourceConnections",
    );

    /** @type {AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null} */
    let resourceConnections = null;

    const succeed = check(res, {
        "AccessListsGetResourceConnections - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceConnections;
    }

    check(res, {
        "AccessListsGetResourceConnections - body is valid": (r) => {
            try {
                resourceConnections = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceConnections;
}
