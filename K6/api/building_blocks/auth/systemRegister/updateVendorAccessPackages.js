import { check } from 'k6';
import { SystemRegisterApiClient } from "../../../../clients/auth/index.js"

/**
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @param {Array<{ urn: string }> } body
 * @returns (string | ArrayBuffer | null)
 */
export function UpdateVendorAccessPackages(systemRegisterClient, systemId, body) {
    const res = systemRegisterClient.UpdateVendorAccessPackages(systemId, body)
    check(res,
        {
            'UpdateVendorAccessPackages - status code is 200': (r) => r.status === 200,
            'UpdateVendorAccessPackages - status text is 200 OK': (r) => r.status_text == "200 OK",
            'UpdateVendorAccessPackages - body is not empty': (r) => {
                const res_body = JSON.parse(r.body);
                return res_body !== null && res_body !== undefined;
            }
        });
    return res.body
}
