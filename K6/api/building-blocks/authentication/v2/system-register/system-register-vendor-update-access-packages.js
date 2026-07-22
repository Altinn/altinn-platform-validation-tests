import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/system-register/index.js";

/**
 * Updates access packages on a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {AccessPackage[]} accessPackages Access packages.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Update result.
 */
export function SystemRegisterVendorUpdateAccessPackages(
    systemRegisterClient,
    systemId,
    accessPackages,
    labels = null,
) {
    const res = systemRegisterClient.SystemRegisterVendorUpdateAccessPackages(
        systemId,
        accessPackages,
        labels,
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "SystemRegisterVendorUpdateAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorUpdateAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemRegisterVendorUpdateAccessPackages - body is valid": (r) => {
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
