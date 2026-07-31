import { check } from "k6";

import { RequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Approves a system user request.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} partyId Party the request was made for.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the request was approved.
 */
export function RequestSystemUserApprove(
    requestSystemUserClient,
    partyId,
    requestId,
    labels = null,
) {
    const res = requestSystemUserClient.RequestSystemUserApprove(
        partyId,
        requestId,
        labels,
    );

    const succeed = check(res, {
        "RequestSystemUserApprove - status code is 200": (r) => r.status === 200,
        "RequestSystemUserApprove - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    let approved = false;

    check(res, {
        "RequestSystemUserApprove - body is valid": (r) => {
            try {
                approved = JSON.parse(r.body) === true;

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return approved;
}
