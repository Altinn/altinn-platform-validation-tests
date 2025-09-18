import { check } from 'k6';
import { SystemRegisterApiClient } from "../../../../clients/auth/index.js"

/**
 * Retrieves a list of the predfined default rights for the Product type, if any
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @returns (string | ArrayBuffer | null)
 */
export function GetSystemRegisterRights(systemRegisterClient, systemId) {
    const res = systemRegisterClient.GetSystemRegisterRights(systemId)
    check(res, {
        'GetSystemRegisterRights - status code is 200': (r) => r.status === 200,
        'GetSystemRegisterRights - status text is 200 OK': (r) => r.status_text == "200 OK",
        'GetSystemRegisterRights - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body
}
