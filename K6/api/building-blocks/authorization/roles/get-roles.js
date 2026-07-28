import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RolesResponse,
} from "../../../../clients/authorization/types.js";

/**
 * Get Roles
 *
 * GET /meta/info/roles
 *
 * @param {RolesApiClient} rolesApiClient A client to interact with the Roles API
 * @param {{[x: string]: string}} [labels]
 * Optional k6 tags merged with default request tags.
 * @returns {RolesResponse} TODO: description
 */
export function GetRoles(rolesApiClient, labels = null) {
    const res = rolesApiClient.GetRoles(labels);

    /** @type {RolesResponse} */
    let res_body = [];

    const succeed = check(res, {
        "GetRoles - status code is 200": (r) => r.status === 200,
        "GetRoles - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRoles - body is valid": (r) => {
            try {
                res_body = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return res_body;
}
