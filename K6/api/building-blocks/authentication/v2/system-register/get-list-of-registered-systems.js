import { check } from "k6";

import { SystemRegisterClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Retrieves all registered systems.
 *
 * Requires the `altinn:portal/enduser` scope.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RegisteredSystemDTO[]|null} Registered systems.
 */
export function GetListOfRegisteredSystems(
    systemRegisterClient,
    labels = null,
) {
    const res = systemRegisterClient.GetListOfRegisteredSystems(labels);

    /** @type {RegisteredSystemDTO[]|null} */
    let systems = null;

    const succeed = check(res, {
        "GetListOfRegisteredSystems - status code is 200": (r) =>
            r.status === 200,
        "GetListOfRegisteredSystems - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systems;
    }

    check(res, {
        "GetListOfRegisteredSystems - body is valid": (r) => {
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
