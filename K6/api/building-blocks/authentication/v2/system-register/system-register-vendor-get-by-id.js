import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/system-register/index.js";

/**
 * Retrieves a registered system by id.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RegisteredSystemResponse|null} Registered system.
 */
export function SystemRegisterVendorGetById(
    systemRegisterClient,
    systemId,
    labels = null,
) {
    const res = systemRegisterClient.SystemRegisterVendorGetById(
        systemId,
        labels,
    );

    /** @type {RegisteredSystemResponse|null} */
    let system = null;

    const succeed = check(res, {
        "SystemRegisterVendorGetById - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorGetById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return system;
    }

    check(res, {
        "SystemRegisterVendorGetById - body is valid": (r) => {
            try {
                system = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return system;
}
