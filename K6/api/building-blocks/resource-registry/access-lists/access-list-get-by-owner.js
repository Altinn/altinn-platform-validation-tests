import { check } from "k6";

import { AccessListClient } from "../../../../clients/access-list/index.js";

/**
 * Gets all access lists for a resource owner.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {Object|null} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListInfoDtoPaginated|null} Paginated access lists.
 */
export function AccessListGetByOwner(
    accessListClient,
    owner,
    query = null,
    labels = null,
) {
    const res = accessListClient.AccessListGetByOwner(owner, query, labels);

    /** @type {AccessListInfoDtoPaginated|null} */
    let accessLists = null;

    const succeed = check(res, {
        "AccessListGetByOwner - status code is 200": (r) =>
            r.status === 200,
        "AccessListGetByOwner - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
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
