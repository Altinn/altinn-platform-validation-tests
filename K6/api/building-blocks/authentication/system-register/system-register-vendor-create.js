import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { RegisterSystemRequest } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a new registered system.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {RegisterSystemRequest} request System registration request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Created system identifier.
 */
export function SystemRegisterVendorCreate(
    systemRegisterClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => systemRegisterClient.SystemRegisterVendorCreate(request, labels),
        "SystemRegisterVendorCreate",
    );

    /** @type {string|null} */
    let systemId = null;

    const succeed = check(res, {
        "SystemRegisterVendorCreate - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorCreate - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemId;
    }

    check(res, {
        "SystemRegisterVendorCreate - body is valid": (r) => {
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
