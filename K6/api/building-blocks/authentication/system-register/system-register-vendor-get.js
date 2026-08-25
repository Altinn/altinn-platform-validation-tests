import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { RegisteredSystemDTO } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves all vendor registered systems.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RegisteredSystemDTO[]|null} Registered systems.
 */
export function SystemRegisterVendorGet(
    systemRegisterClient,
    labels = null,
) {
    const res = withRetries(
        () => systemRegisterClient.SystemRegisterVendorGet(labels),
        "SystemRegisterVendorGet",
    );

    /** @type {RegisteredSystemDTO[]|null} */
    let systems = null;

    const succeed = check(res, {
        "SystemRegisterVendorGet - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorGet - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systems;
    }

    check(res, {
        "SystemRegisterVendorGet - body is valid": (r) => {
            try {
                systems = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systems;
}
