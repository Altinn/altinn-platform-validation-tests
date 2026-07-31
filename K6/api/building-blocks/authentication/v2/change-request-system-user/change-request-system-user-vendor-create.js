import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

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

    // A new change request answers 201. The API answers 200 when there is nothing to
    // change, and when the correlation id already refers to a change request. Both are
    // successful, so the status the caller cares about is asserted in the domain checks.
    const succeed = check(res, {
        "ChangeRequestSystemUserVendorCreate - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
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
