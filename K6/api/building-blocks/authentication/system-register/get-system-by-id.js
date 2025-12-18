import { check } from "k6";
import { SystemRegisterApiClient } from "../../../../clients/authentication/index.js";


/**
 * Retrieves a Registered System frontend DTO for the systemId.
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @returns (string | ArrayBuffer | null)
 */
export function GetSystemById(systemRegisterClient, systemId) {
    const res = systemRegisterClient.GetSystemRegisterById(systemId);
    check(res, {
        "GetSystemById - status code is 200": (r) => r.status === 200,
        "GetSystemById - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemById - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body;
}
