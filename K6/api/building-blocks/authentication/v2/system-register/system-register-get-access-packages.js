import { check } from "k6";

import { SystemRegisterClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Retrieves default access packages for a system.
 *
 * Requires the `altinn:portal/enduser` scope. A Maskinporten token on the
 * systemregister scopes gets a 403 here; for the access packages a vendor
 * registered, use SystemRegisterVendorGetById instead.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {boolean|null} [useOldFormatForApp] Whether to use old app format.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessPackage[]|null} Access packages.
 */
export function SystemRegisterGetAccessPackages(
    systemRegisterClient,
    systemId,
    useOldFormatForApp = null,
    labels = null,
) {
    const res = systemRegisterClient.SystemRegisterGetAccessPackages(
        systemId,
        useOldFormatForApp,
        labels,
    );

    /** @type {AccessPackage[]|null} */
    let accessPackages = null;

    const succeed = check(res, {
        "SystemRegisterGetAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterGetAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackages;
    }

    check(res, {
        "SystemRegisterGetAccessPackages - body is valid": (r) => {
            try {
                accessPackages = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessPackages;
}
