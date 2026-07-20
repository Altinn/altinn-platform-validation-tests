import { check } from "k6";

import { AccessListClient } from "../../../../clients/access-list/index.js";

/**
 * Removes a resource connection from an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {string} resourceIdentifier Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListResourceConnectionWithVersionDto|null}
 */
export function AccessListsDeleteResourceConnection(
    accessListClient,
    owner,
    identifier,
    resourceIdentifier,
    labels = null,
) {
    const res = accessListClient.AccessListsDeleteResourceConnection(
        owner,
        identifier,
        resourceIdentifier,
        labels,
    );

    /** @type {AccessListResourceConnectionWithVersionDto|null} */
    let resourceConnection = null;

    const succeed = check(res, {
        "AccessListsDeleteResourceConnection - status code is 200": (r) =>
            r.status === 200,
        "AccessListsDeleteResourceConnection - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceConnection;
    }

    check(res, {
        "AccessListsDeleteResourceConnection - body is valid": (r) => {
            try {
                resourceConnection = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceConnection;
}
