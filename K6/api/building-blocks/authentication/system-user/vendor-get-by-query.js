import { check } from "k6";

import { SystemUserClient } from "../../../../clients/authentication/index.js";
import { SystemUser, SystemUserVendorQuery } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a SystemUser by vendor query.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {SystemUserVendorQuery|null} query Query parameters, with the keys "system-id" and "external-ref".
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemUser|null} System user.
 */
export function SystemUserVendorGetByQuery(
    systemUserClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.SystemUserVendorGetByQuery(query, labels),
        "SystemUserVendorGetByQuery",
    );

    /** @type {SystemUser|null} */
    let systemUser = null;

    const succeed = check(res, {
        "SystemUserVendorGetByQuery - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUser;
    }

    check(res, {
        "SystemUserVendorGetByQuery - body is valid": (r) => {
            try {
                systemUser = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemUser;
}
