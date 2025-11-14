import { check } from "k6";
import { RolesApiClient } from "../../../../clients/auth/index.js";

/**
 * Get Roles
 * @param {RolesApiClient} rolesApiClient A client to interact with the Roles API
 * @param {*} label
 */

export function GetRoles(rolesApiClient,  label = null) {
    const res = rolesApiClient.GetRoles(label);

    const succeed = check(res, {
        "GetRoles - status code is 200": (r) => r.status === 200,
        "GetRoles - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetRoles - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
    return res.body;
}
