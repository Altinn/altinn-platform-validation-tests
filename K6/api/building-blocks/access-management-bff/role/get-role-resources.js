import { check } from "k6";

import { ResourceAM } from "../../../../clients/access-management-bff/common/common.types.js";
import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";
import { GetRoleResourcesQuery } from "../../../../clients/access-management-bff/role/role.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resources a role grants access to.
 *
 * @param {RoleClient} roleClient Client for the role endpoints.
 * @param {GetRoleResourcesQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRoleResourcesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ResourceAM>|null} The resources.
 */
export function GetRoleResources(
    roleClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => roleClient.GetRoleResources(queryParams, labels),
        "GetRoleResources",
    );

    /** @type {Array<ResourceAM>|null} */
    let resources = null;

    const succeed = check(res, {
        "GetRoleResources - status code is 200": (r) =>
            r.status === 200,
        "GetRoleResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetRoleResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
