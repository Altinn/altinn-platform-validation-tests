import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListInfoDto } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes an access list by owner and identifier.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessListInfoDto|null} Deleted access list information.
 */
export function AccessListDelete(
    accessListClient,
    owner,
    identifier,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListDelete(
            owner,
            identifier,
            labels,
        ),
        "AccessListDelete",
    );

    /** @type {AccessListInfoDto|null} */
    let accessList = null;

    const succeed = check(res, {
        "AccessListDelete - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        if (res.status !== 204) {
            console.log(res.status);
            console.log(res.body);
        }

        return accessList;
    }

    check(res, {
        "AccessListDelete - body is valid": (r) => {
            try {
                accessList = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessList;
}
