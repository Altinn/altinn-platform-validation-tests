import { check } from "k6";

import { SystemRegisterClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Creates a new registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {RegisterSystemRequest} request System registration request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Created system identifier.
 */
export function CreateRegisteredSystem(
    systemRegisterClient,
    request,
    labels = null,
) {
    const res = systemRegisterClient.CreateRegisteredSystem(
        request,
        labels,
    );

    /** @type {string|null} */
    let systemId = null;

    const succeed = check(res, {
        "CreateRegisteredSystem - status code is 200": (r) =>
            r.status === 200,
        "CreateRegisteredSystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemId;
    }

    check(res, {
        "CreateRegisteredSystem - body is valid": (r) => {
            try {
                systemId = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemId;
}
