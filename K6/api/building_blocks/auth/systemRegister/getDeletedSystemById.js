import { check } from 'k6';
import { SystemRegisterApiClient } from "../../../../clients/auth/index.js"

/**
 * Retrieves a Registered System for the systemId.
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @returns (string | ArrayBuffer | null)
 */
export function GetDeletedSystemByID(systemRegisterClient, systemId) {
    // Needs to use the Vendor as the "normal" endpoint returns a 200 and no indication of a soft deletion (i.e isDeleted: true)
    const res = systemRegisterClient.GetVendorSystemRegisterById(systemId)
    check(res, {
        'GetDeletedSystemByID - status code is 200': (r) => r.status === 200,
        'GetDeletedSystemByID - status text is 200 OK': (r) => r.status_text == "200 OK",
        'GetDeletedSystemByID - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null || res_body !== undefined;
        }
    });
    return res.body
}
