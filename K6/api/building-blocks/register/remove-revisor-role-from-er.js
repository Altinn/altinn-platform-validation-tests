import { check } from "k6";

import { RegisterApiClient } from "../../../clients/authentication/index.js";

/**
 *
 * @param {RegisterApiClient} registerClient TODO: description
 * @param {string } soapErUsername TODO: description
 * @param {string } soapErPassword TODO: description
 * @param {string } clientOrg TODO: description
 * @param {string } facilitatorOrg TODO: description
 * @returns (string | ArrayBuffer | null)
 */
export function RemoveRevisorRoleFromEr(
    registerClient,
    soapErUsername,
    soapErPassword,
    clientOrg,
    facilitatorOrg,
) {
    const res = registerClient.RemoveRevisorRoleFromEr(
        soapErUsername,
        soapErPassword,
        clientOrg,
        facilitatorOrg,
    );

    check(res, {
        "status code MUST be 200": (res) => res.status == 200,
    });

    return res;
}
