import { check } from "k6";

import { SystemRegisterClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Updates a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {RegisterSystemRequest} request Updated system model.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Update result.
 */
export function UpdateWholeRegisteredSystem(
    systemRegisterClient,
    systemId,
    request,
    labels = null,
) {
    const res = systemRegisterClient.UpdateWholeRegisteredSystem(
        systemId,
        request,
        labels,
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "UpdateWholeRegisteredSystem - status code is 200": (r) =>
            r.status === 200,
        "UpdateWholeRegisteredSystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "UpdateWholeRegisteredSystem - body is valid": (r) => {
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
