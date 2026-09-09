import { check } from "k6";

import { SystemUserClient } from "../../../../clients/authentication/index.js";
import { SystemUser, SystemUserByExternalIdQuery } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a SystemUser by external id information.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {SystemUserByExternalIdQuery|null} query Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemUser|null} System user.
 */
export function SystemUserGetByExternalId(
    systemUserClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.SystemUserGetByExternalId(query, labels),
        "SystemUserGetByExternalId",
    );

    /** @type {SystemUser|null} */
    let systemUser = null;

    const succeed = check(res, {
        "SystemUserGetByExternalId - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUser;
    }

    check(res, {
        "SystemUserGetByExternalId - body is valid": (r) => {
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
