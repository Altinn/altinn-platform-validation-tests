import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { RegisterSystemRequest, SystemRegisterUpdateResult } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates a registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {RegisterSystemRequest} request Updated system model.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemRegisterUpdateResult|null} Update result.
 */
export function SystemRegisterVendorUpdate(
    systemRegisterClient,
    systemId,
    request,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemRegisterClient.SystemRegisterVendorUpdate(
                systemId,
                request,
                labels,
            ),
        "SystemRegisterVendorUpdate",
    );

    /** @type {SystemRegisterUpdateResult|null} */
    let result = null;

    const succeed = check(res, {
        "SystemRegisterVendorUpdate - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemRegisterVendorUpdate - body is valid": (r) => {
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
