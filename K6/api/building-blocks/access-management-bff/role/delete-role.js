import { check } from "k6";

import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes a role one party holds for another.
 *
 * @param {RoleClient} roleClient Client for the role endpoints.
 * @param {DeleteRoleQuery|null} [queryParams] Optional query parameters. Use
 * {@link DeleteRoleQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the role was revoked.
 */
export function DeleteRole(roleClient, queryParams = null, labels = null) {
    const res = withRetries(
        () => roleClient.DeleteRole(queryParams, labels),
        "DeleteRole",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteRole - status code is 200": (r) =>
            r.status === 200,
        "DeleteRole - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
