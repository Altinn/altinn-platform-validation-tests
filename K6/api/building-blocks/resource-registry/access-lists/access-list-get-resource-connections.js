import { check } from "k6";

import { AccessListClient } from "../../../../clients/access-list/index.js";

/**
 * Gets all resource connections for an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {Object|null} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null}
 */
export function AccessListsGetResourceConnections(
    accessListClient,
    owner,
    identifier,
    query = null,
    labels = null,
) {
    const res = accessListClient.AccessListsGetResourceConnections(
        owner,
        identifier,
        query,
        labels,
    );

    /** @type {AccessListResourceConnectionDtoAggregateVersionVersionedPaginated|null} */
    let resourceConnections = null;

    const succeed = check(res, {
        "AccessListsGetResourceConnections - status code is 200": (r) =>
            r.status === 200,
        "AccessListsGetResourceConnections - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
