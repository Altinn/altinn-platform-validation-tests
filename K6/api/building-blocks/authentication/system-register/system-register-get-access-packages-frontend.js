import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves default access packages for a system.
 *
 * Requires the `altinn:portal/enduser` scope.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {boolean|null} [useOldFormatForApp] Whether to use old app format.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessPackage[]|null} Access packages.
 */
export function SystemRegisterGetAccessPackagesFrontend(
    systemRegisterClient,
    systemId,
    useOldFormatForApp = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemRegisterClient.SystemRegisterGetAccessPackagesFrontend(
                systemId,
                useOldFormatForApp,
                labels,
            ),
        "SystemRegisterGetAccessPackagesFrontend",
    );

    /** @type {AccessPackage[]|null} */
    let accessPackages = null;

    const succeed = check(res, {
        "SystemRegisterGetAccessPackagesFrontend - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterGetAccessPackagesFrontend - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackages;
    }

    check(res, {
        "SystemRegisterGetAccessPackagesFrontend - body is valid": (r) => {
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
