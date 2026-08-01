import { check } from "k6";

import { SystemRegisterClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Deletes a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Delete result.
 */
export function SetDeleteOnRegisteredSystem(
    systemRegisterClient,
    systemId,
    labels = null,
) {
    const res = systemRegisterClient.SetDeleteOnRegisteredSystem(
        systemId,
        labels,
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "SetDeleteOnRegisteredSystem - status code is 200": (r) =>
            r.status === 200,
        "SetDeleteOnRegisteredSystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SetDeleteOnRegisteredSystem - body is valid": (r) => {
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
