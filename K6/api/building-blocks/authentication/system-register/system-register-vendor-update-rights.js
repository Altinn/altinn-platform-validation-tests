import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { Right, SystemRegisterUpdateResult } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates rights on a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {Right[]} rights Rights.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Update result.
 */
export function SystemRegisterVendorUpdateRights(
    systemRegisterClient,
    systemId,
    rights,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemRegisterClient.SystemRegisterVendorUpdateRights(
                systemId,
                rights,
                labels,
            ),
        "SystemRegisterVendorUpdateRights",
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "SystemRegisterVendorUpdateRights - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorUpdateRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemRegisterVendorUpdateRights - body is valid": (r) => {
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
