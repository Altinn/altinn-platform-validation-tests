import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/access-management-bff/system-register/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the systems in the system register.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the system
 * register endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The registered systems. The API does not publish a
 * schema for this response.
 */
export function GetRegisteredSystems(systemRegisterClient, labels = null) {
    const res = withRetries(
        () => systemRegisterClient.GetRegisteredSystems(labels),
        "GetRegisteredSystems",
    );

    /** @type {any} */
    let systems = null;

    const succeed = check(res, {
        "GetRegisteredSystems - status code is 200": (r) =>
            r.status === 200,
        "GetRegisteredSystems - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systems;
    }

    check(res, {
        "GetRegisteredSystems - body is valid": (r) => {
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
