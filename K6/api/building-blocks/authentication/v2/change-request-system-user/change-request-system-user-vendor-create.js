import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../clients/change-request-system-user/index.js";

/**
 * Creates a change request for a system user.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {ChangeRequestSystemUser} request Change request payload.
 * @param {string|null} [correlationId] Correlation identifier.
 * @param {string|null} [systemUserId] System user identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponse|null} Change request response.
 */
export function ChangeRequestSystemUserVendorCreate(
    changeRequestSystemUserClient,
    request,
    correlationId = null,
    systemUserId = null,
    labels = null,
) {
    const res = changeRequestSystemUserClient.ChangeRequestSystemUserVendorCreate(
        request,
        correlationId,
        systemUserId,
        labels,
    );

    /** @type {ChangeRequestResponse|null} */
    let changeRequestResponse = null;

    const succeed = check(res, {
        "ChangeRequestSystemUserVendorCreate - status code is 200": (r) =>
            r.status === 200,
        "ChangeRequestSystemUserVendorCreate - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeRequestResponse;
    }

    check(res, {
        "ChangeRequestSystemUserVendorCreate - body is valid": (r) => {
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
