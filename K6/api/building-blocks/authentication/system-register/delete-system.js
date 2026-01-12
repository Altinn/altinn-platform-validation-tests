import { check } from "k6";
import { SystemRegisterApiClient } from "../../../../clients/authentication/index.js";

/**
 * Set the registered system to be deleted.
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } systemId The Id of the Registered System
 * @returns (string | ArrayBuffer | null)
 */
export function DeleteSystem(systemRegisterClient, systemId) {
    const res = systemRegisterClient.DeleteSystemSystemRegister(systemId);
    check(res, {
        "DeleteSystem - status code is 200": (r) => r.status === 200,
        "DeleteSystem - status text is 200 OK": (r) => r.status_text == "200 OK",
        "DeleteSystem - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body;
}
