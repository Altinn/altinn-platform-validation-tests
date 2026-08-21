import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListResourceConnectionWithVersionDto } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a resource connection from an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {string} resourceIdentifier Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListResourceConnectionWithVersionDto|null} Parsed response body, or null when the call failed.
 */
export function AccessListsDeleteResourceConnection(
    accessListClient,
    owner,
    identifier,
    resourceIdentifier,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListsDeleteResourceConnection(
            owner,
            identifier,
            resourceIdentifier,
            labels,
        ),
        "AccessListsDeleteResourceConnection",
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
