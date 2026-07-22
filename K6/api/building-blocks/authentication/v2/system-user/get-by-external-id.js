import { check } from "k6";

import { SystemUserClient } from "../../../../clients/system-user/index.js";


/**
 * Retrieves a SystemUser by external id information.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {Object} query Query parameters.
 * @param {string} [query.clientId] MaskinPorten client id.
 * @param {string} [query.systemProviderOrgNo] System provider organisation number.
 * @param {string} [query.systemUserOwnerOrgNo] System user owner organisation number.
 * @param {string} [query.externalRef] External reference.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemUser|null} System user.
 */
export function SystemUserGetByExternalId(
    systemUserClient,
    query = null,
    labels = null,
) {
    const res = systemUserClient.SystemUserGetByExternalId(
        query,
        labels,
    );

    /** @type {SystemUser|null} */
    let systemUser = null;

    const succeed = check(res, {
        "SystemUserGetByExternalId - status code is 200": (r) =>
            r.status === 200,
        "SystemUserGetByExternalId - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
