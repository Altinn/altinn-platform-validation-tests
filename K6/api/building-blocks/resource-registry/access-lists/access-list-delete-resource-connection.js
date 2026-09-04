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
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
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
        () => accessListClient.AccessListDeleteResourceConnection(
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
