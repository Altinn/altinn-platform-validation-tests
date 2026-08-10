import { check } from "k6";

import { SystemUserClient } from "../../../../../clients/authentication/v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves SystemUsers belonging to a vendor system.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {string} systemId System identifier.
 * @param {object} [query] Query parameters.
 * @param {Int64Opaque} [query.token] Continuation token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemUserPaginated|null} Paginated SystemUsers.
 */
export function SystemUserVendorGetBySystem(
    systemUserClient,
    systemId,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemUserClient.SystemUserVendorGetBySystem(
                systemId,
                query,
                labels,
            ),
        "SystemUserVendorGetBySystem",
    );

    /** @type {SystemUserPaginated|null} */
    let result = null;

    const succeed = check(res, {
        "SystemUserVendorGetBySystem - status code is 200": (r) =>
            r.status === 200,
        "SystemUserVendorGetBySystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemUserVendorGetBySystem - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return result;
}
