import { check } from "k6";

import { SystemRegisterApiClient } from "../../../../clients/authentication/index.js";

/**
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @param {string } vendorId TODO: description
 * @param {string } name TODO: description
 * @param {string[] } clientId TODO: description
 * @param {{ en: string, nn: string, nb: string } } description TODO: description
 * @param {Array<{resource: Array<{value: string, id: string}>}>} rights TODO: description
 * @param {string[] } allowedRedirectUrls TODO: description
 * @returns (string | ArrayBuffer | null)
 */
export function UpdateVendorSystemRegister(systemRegisterClient,
    systemId,
    vendorId,
    name,
    clientId,
    description,
    rights,
    allowedRedirectUrls
) {
    const res = systemRegisterClient.UpdateVendorSystemRegister(
        systemId,
        vendorId,
        name,
        clientId,
        description,
        rights,
        allowedRedirectUrls
    );
    check(res, {
        "UpdateVendorSystemRegister - status code is 200": (r) => r.status === 200,
        "UpdateVendorSystemRegister - status text is 200 OK": (r) => r.status_text == "200 OK",
        "UpdateVendorSystemRegister - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body;
}
