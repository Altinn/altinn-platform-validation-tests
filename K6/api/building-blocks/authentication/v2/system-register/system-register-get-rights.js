import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/system-register/index.js";

/**
 * Retrieves default rights for a system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {boolean|null} [useOldFormatForApp] Whether to use old app format.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Right[]|null} Rights.
 */
export function SystemRegisterGetRights(
    systemRegisterClient,
    systemId,
    useOldFormatForApp = null,
    labels = null,
) {
    const res = systemRegisterClient.SystemRegisterGetRights(
        systemId,
        useOldFormatForApp,
        labels,
    );

    /** @type {Right[]|null} */
    let rights = null;

    const succeed = check(res, {
        "SystemRegisterGetRights - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterGetRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rights;
    }

    check(res, {
        "SystemRegisterGetRights - body is valid": (r) => {
            try {
                rights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rights;
}
