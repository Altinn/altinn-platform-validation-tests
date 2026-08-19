import { check } from "k6";

import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets role resources by role id.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {string} id Role identifier.
 * @param {RolesGetRoleResourcesByIdQueryBuilder | object} query Query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
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
        "RolesGetRoleResourcesById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
