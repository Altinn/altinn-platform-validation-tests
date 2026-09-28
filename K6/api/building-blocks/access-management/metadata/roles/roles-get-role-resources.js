import { check } from "k6";

import { ResourceDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { RolesGetRoleResourcesQuery } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets role resources.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {RolesGetRoleResourcesQuery} query Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceDto|null} Role resource.
 */
export function RolesGetRoleResources(
    rolesClient,
    query,
    labels = null,
) {
    const res = withRetries(
        () => rolesClient.RolesGetRoleResources(query, labels),
        "RolesGetRoleResources",
    );

    /** @type {ResourceDto|null} */
    let resource = null;

    const succeed = check(res, {
        "RolesGetRoleResources - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "RolesGetRoleResources - body is valid": (r) => {
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
