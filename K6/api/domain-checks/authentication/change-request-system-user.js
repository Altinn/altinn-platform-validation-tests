import { check } from "k6";

import { ChangeRequestResponse } from "../../../clients/authentication/v2/types.js";
import { missingRights } from "../common/rights.js";

/**
 * Checks that a change request is for the expected system user.
 *
 * @param {ChangeRequestResponse} changeRequest - The created change request.
 * @param {string} expectedSystemUserId - The system user the change request was made for.
 * @returns {boolean} True if the change request is for that system user, false otherwise.
 */
function CheckChangeRequestSystemUserId(changeRequest, expectedSystemUserId) {
    const success = check(changeRequest, {
        "CheckChangeRequestSystemUserId - Change request is for the expected system user": (request) => {
            return request?.systemUserId === expectedSystemUserId;
        },
    });

    if (!success) {
        console.error(`CheckChangeRequestSystemUserId - expected systemUserId '${expectedSystemUserId}', got '${changeRequest?.systemUserId}'`);
        console.error(`CheckChangeRequestSystemUserId - change request returned: ${JSON.stringify(changeRequest)}`);
    }

    return success;
}

/**
 * Checks that a change request carries the url the customer is sent to in order to approve it.
 *
 * @param {ChangeRequestResponse} changeRequest - The created change request.
 * @returns {boolean} True if the confirm url is there, false otherwise.
 */
function CheckChangeRequestConfirmUrl(changeRequest) {
    const success = check(changeRequest, {
        "CheckChangeRequestConfirmUrl - Change request carries a confirm url": (request) => {
            return typeof request?.confirmUrl === "string" && request.confirmUrl.length > 0;
        },
    });

    if (!success) {
        console.error(`CheckChangeRequestConfirmUrl - confirmUrl was '${changeRequest?.confirmUrl}'`);
        console.error(`CheckChangeRequestConfirmUrl - change request returned: ${JSON.stringify(changeRequest)}`);
    }

    return success;
}

/**
 * Checks that a change request has the expected status.
 *
 * @param {ChangeRequestResponse} changeRequest - The change request to check.
 * @param {string} expectedStatus - The status the change request is expected to have.
 * @returns {boolean} True if the status matches, false otherwise.
 */
function CheckChangeRequestStatus(changeRequest, expectedStatus) {
    const success = check(changeRequest, {
        [`CheckChangeRequestStatus - Change request has status '${expectedStatus}'`]: (request) =>
            request?.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckChangeRequestStatus - expected status '${expectedStatus}', got '${changeRequest?.status}'`);
        console.error(`CheckChangeRequestStatus - change request returned: ${JSON.stringify(changeRequest)}`);
    }

    return success;
}

/**
 * Checks that a change request asks for the rights it was created with.
 *
 * @param {ChangeRequestResponse} changeRequest - The change request to check.
 * @param {Right[]} expectedRights - The rights the change request should require.
 * @returns {boolean} True if all expected rights are required, false otherwise.
 */
function CheckChangeRequestRequiredRights(changeRequest, expectedRights) {
    const actualRights = changeRequest?.requiredRights ?? [];
    const missing = missingRights(actualRights, expectedRights);

    const success = check(changeRequest, {
        "CheckChangeRequestRequiredRights - Change request requires all expected rights": () =>
            missing.length === 0,
    });

    if (!success) {
        console.error(`CheckChangeRequestRequiredRights - missing rights: ${JSON.stringify(missing)}`);
        console.error(`CheckChangeRequestRequiredRights - rights returned: ${JSON.stringify(actualRights)}`);
    }

    return success;
}

/**
 * Checks that a change request holds no rights or access packages on either side.
 *
 * For the case where the vendor asks for nothing, which the API answers without
 * creating a change request at all.
 *
 * @param {ChangeRequestResponse} changeRequest - The change request to check.
 * @returns {boolean} True if all four sets are empty, false otherwise.
 */
function CheckChangeRequestIsEmpty(changeRequest) {
    const sets = [
        "requiredRights",
        "unwantedRights",
        "requiredAccessPackages",
        "unwantedAccessPackages",
    ];

    const nonEmpty = sets.filter((set) => (changeRequest?.[set] ?? []).length > 0);

    const success = check(changeRequest, {
        "CheckChangeRequestIsEmpty - Change request asks for nothing": () => nonEmpty.length === 0,
    });

    if (!success) {
        console.error(`CheckChangeRequestIsEmpty - sets that were not empty: ${JSON.stringify(nonEmpty)}`);
        console.error(`CheckChangeRequestIsEmpty - change request returned: ${JSON.stringify(changeRequest)}`);
    }

    return success;
}

/**
 * Checks that asking again returned the change request that already existed.
 *
 * A change request is idempotent on the correlation id, not on its contents: the
 * same rights sent with a fresh correlation id creates a second change request,
 * while reusing the correlation id answers with the first one.
 *
 * @param {ChangeRequestResponse} changeRequest - The change request returned by the second call.
 * @param {string} expectedId - Id of the change request the first call created.
 * @returns {boolean} True if the same change request came back, false otherwise.
 */
function CheckSameChangeRequest(changeRequest, expectedId) {
    const success = check(changeRequest, {
        "CheckSameChangeRequest - Asking again returned the existing change request": (request) => {
            return request?.id === expectedId;
        },
    });

    if (!success) {
        console.error(`CheckSameChangeRequest - expected id '${expectedId}', got '${changeRequest?.id}'`);
        console.error(`CheckSameChangeRequest - change request returned: ${JSON.stringify(changeRequest)}`);
    }

    return success;
}

/**
 * Checks that an earlier step produced a change request to act on.
 *
 * A group that needs one cannot say anything useful without it, so a caller that
 * gets false back should fail() and stop the run at the step that broke.
 *
 * @param {string|undefined} changeRequestId - The change request id the earlier step should have produced.
 * @returns {boolean} True if there is a change request to act on, false otherwise.
 */
function CheckChangeRequestId(changeRequestId) {
    const success = check(changeRequestId, {
        "CheckChangeRequestId - An earlier step produced a change request": (id) => {
            return id !== null && id !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckChangeRequestId - expected a change request id from an earlier step, got ${JSON.stringify(changeRequestId)}`);
    }

    return success;
}

/**
 * Checks that the customer has a system user for a change request to act on.
 *
 * @param {string|undefined} systemUserId - The system user the arrange step should have produced.
 * @returns {boolean} True if there is a system user to change, false otherwise.
 */
function CheckSystemUserToChange(systemUserId) {
    const success = check(systemUserId, {
        "CheckSystemUserToChange - The customer has a system user to change": (id) => {
            return id !== null && id !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckSystemUserToChange - expected a system user id from the arrange step, got ${JSON.stringify(systemUserId)}`);
    }

    return success;
}

/**
 * Checks that a change request was approved.
 *
 * @param {boolean} approved - Whether the approve call reported success.
 * @returns {boolean} True if the change request was approved, false otherwise.
 */
function CheckChangeRequestApproved(approved) {
    const success = check(approved, {
        "CheckChangeRequestApproved - Change request was approved": (result) => result === true,
    });

    if (!success) {
        console.error(`CheckChangeRequestApproved - approve did not report success, got '${approved}'`);
    }

    return success;
}

export const ChangeRequestSystemUserDomainChecks = {
    CheckChangeRequestSystemUserId,
    CheckChangeRequestConfirmUrl,
    CheckChangeRequestStatus,
    CheckChangeRequestRequiredRights,
    CheckChangeRequestIsEmpty,
    CheckSameChangeRequest,
    CheckChangeRequestId,
    CheckSystemUserToChange,
    CheckChangeRequestApproved,
};
