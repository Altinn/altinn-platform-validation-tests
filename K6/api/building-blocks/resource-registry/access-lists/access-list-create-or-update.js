import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListInfoDto, CreateAccessListModel } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates or updates an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {CreateAccessListModel} request Access list payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessListInfoDto|null} Access list information.
 */
export function AccessListCreateOrUpdate(
    accessListClient,
    owner,
    identifier,
    request,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListUpsert(
            owner,
            identifier,
            request,
            {},
            labels,
        ),
        "AccessListCreateOrUpdate",
    );

    /** @type {AccessListInfoDto|null} */
    let accessList = null;

    const succeed = check(res, {
        "AccessListCreateOrUpdate - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessList;
    }

    check(res, {
        "AccessListCreateOrUpdate - body is valid": (r) => {
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
