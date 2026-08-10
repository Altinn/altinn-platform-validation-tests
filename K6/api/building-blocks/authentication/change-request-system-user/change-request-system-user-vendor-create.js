import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../../clients/authentication/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a change request for a system user.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {ChangeRequestSystemUser} request Change request payload.
 * @param {string|null} [correlationId] Correlation identifier.
 * @param {string|null} [systemUserId] System user identifier.
 * @param {number|null} [expectedStatus] Status the caller expects. Pass 201 for a new
 * change request and 200 when reusing a correlation id, and leave it out to accept either.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponse|null} Change request response.
 */
export function ChangeRequestSystemUserVendorCreate(
    changeRequestSystemUserClient,
    request,
    correlationId = null,
    systemUserId = null,
    expectedStatus = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            changeRequestSystemUserClient.ChangeRequestSystemUserVendorCreate(
                request,
                correlationId,
                systemUserId,
                labels,
            ),
        "ChangeRequestSystemUserVendorCreate",
    );

    /** @type {ChangeRequestResponse|null} */
    let changeRequestResponse = null;

    // A new change request answers 201, and reusing a correlation id answers 200 with
    // the change request that id already refers to. The same rights sent with a fresh
    // correlation id is a new change request, not a repeat, so it answers 201.
    // Both are successful, so a caller that does not care which passes no expectedStatus.
    const succeed = check(res, {
        [expectedStatus === null
            ? "ChangeRequestSystemUserVendorCreate - status code is 200 or 201"
            : `ChangeRequestSystemUserVendorCreate - status code is ${expectedStatus}`]: (r) =>
            expectedStatus === null
                ? r.status === 200 || r.status === 201
                : r.status === expectedStatus,
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
