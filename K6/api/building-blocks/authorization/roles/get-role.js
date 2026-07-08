
import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RoleResponse,
} from "../../../../clients/authorization/index.js";

/**
 * Get Role by ID
 *
 * GET /meta/info/roles/{id}
 *
 * @param {RolesApiClient} rolesApiClient TODO: description
 * @param {string} id Role UUID
 * @param {{[x: string]: string}} [labels] TODO: description
 * @returns {RoleResponse} TODO: description
 */
export function GetRole(rolesApiClient, id, labels = null) {
    const res = rolesApiClient.GetRole(id, labels);

    /** @type {RoleResponse} */
    let res_body = null;

    const succeed = check(res, {
        "GetRole - status code is 200": (r) => r.status === 200,
        "GetRole - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRole - body is valid": (r) => {
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
