import { check } from 'k6';
import { SystemRegisterApiClient } from "../../../../clients/auth/index.js"

/**
 * Create a new System
 * @param {SystemRegisterApiClient} systemRegisterClient A client to interact with the System Register API
 * @param {string } vendorId
 * @param {string } name
 * @param {string[] } clientId
 * @param {{ en: string, nn: string, nb: string } } description
 * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
 * @param {string[] } allowedRedirectUrls
 * @param {Array<{ urn: string }> } accessPackages
 * @returns (string | ArrayBuffer | null)
 */
export function CreateNewSystem(
    systemRegisterClient,
    vendorId,
    name,
    clientId,
    description,
    rights,
    allowedRedirectUrls,
    accessPackages
) {
    const res = systemRegisterClient.CreateSystemRegister(
        vendorId,
        name,
        clientId,
        description,
        rights,
        allowedRedirectUrls,
        accessPackages
    )
    check(res, {
        'CreateNewSystem - status code is 200': (r) => r.status === 200,
        'CreateNewSystem - status text is 200 OK': (r) => r.status_text == "200 OK",
        'CreateNewSystem - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body
}
