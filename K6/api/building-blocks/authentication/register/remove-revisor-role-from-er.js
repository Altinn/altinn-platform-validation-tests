import { check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";

/**
 *
 * @param {RegisterApiClient} registerClient
 * @param {string } soapErUsername
 * @param {string } soapErPassword
 * @param {string } clientOrg
 * @param {string } facilitatorOrg
 * @returns (string | ArrayBuffer | null)
 */
export function RemoveRevisorRoleFromEr(
    registerClient,
    soapErUsername,
    soapErPassword,
    clientOrg,
    facilitatorOrg
) {
    const res = registerClient.RemoveRevisorRoleFromEr(
        soapErUsername,
        soapErPassword,
        clientOrg,
        facilitatorOrg
    );

    check(res, {
        "status code MUST be 200": (res) => res.status == 200,
    });

    return res.body;
}
