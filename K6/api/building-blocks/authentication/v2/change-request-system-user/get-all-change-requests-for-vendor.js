import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Retrieves change requests for a system.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {string} systemId System identifier.
 * @param {GuidOpaque|null} [token] Optional continuation token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponsePaginated|null} Paginated change request response.
 */
export function GetAllChangeRequestsForVendor(
    changeRequestSystemUserClient,
    systemId,
    token = null,
    labels = null,
) {
    const res =
        changeRequestSystemUserClient.GetAllChangeRequestsForVendor(
            systemId,
            token,
            labels,
        );

    /** @type {ChangeRequestResponsePaginated|null} */
    let changeRequestResponse = null;

    const succeed = check(res, {
        "GetAllChangeRequestsForVendor - status code is 200": (r) =>
            r.status === 200,
        "GetAllChangeRequestsForVendor - status text is 200 OK": (
            r,
        ) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeRequestResponse;
    }

    check(res, {
        "GetAllChangeRequestsForVendor - body is valid": (r) => {
            try {
                changeRequestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changeRequestResponse;
}
