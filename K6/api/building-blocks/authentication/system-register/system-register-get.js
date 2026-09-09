import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { RegisteredSystemDTO } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves all registered systems.
 *
 * Requires the `altinn:portal/enduser` scope.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RegisteredSystemDTO[]|null} Registered systems.
 */
export function SystemRegisterGet(
    systemRegisterClient,
    labels = null,
) {
    const res = withRetries(
        () => systemRegisterClient.SystemRegisterGet(labels),
        "SystemRegisterGet",
    );

    /** @type {RegisteredSystemDTO[]|null} */
    let systems = null;

    const succeed = check(res, {
        "SystemRegisterGet - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systems;
    }

    check(res, {
        "SystemRegisterGet - body is valid": (r) => {
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
