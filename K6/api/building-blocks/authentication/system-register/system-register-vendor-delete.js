import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { SystemRegisterUpdateResult } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Delete result.
 */
export function SystemRegisterVendorDelete(
    systemRegisterClient,
    systemId,
    labels = null,
) {
    const res = withRetries(
        () => systemRegisterClient.SystemRegisterVendorDelete(systemId, labels),
        "SystemRegisterVendorDelete",
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "SystemRegisterVendorDelete - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemRegisterVendorDelete - body is valid": (r) => {
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
