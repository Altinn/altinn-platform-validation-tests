import { check } from "k6";

import { ResourceDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { RolesGetRoleResourcesByIdQuery } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets role resources by role id.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {string} id Role identifier.
 * @param {RolesGetRoleResourcesByIdQuery} query Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceDto|null} Role resource.
 */
export function RolesGetRoleResourcesById(
    rolesClient,
    id,
    query,
    labels = null,
) {
    const res = withRetries(
        () => rolesClient.RolesGetRoleResourcesById(id, query, labels),
        "RolesGetRoleResourcesById",
    );

    /** @type {ResourceDto|null} */
    let resource = null;

    const succeed = check(res, {
        "RolesGetRoleResourcesById - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "RolesGetRoleResourcesById - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resource;
}
