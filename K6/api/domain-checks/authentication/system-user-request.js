import { check } from "k6";

import { RequestSystemResponse } from "../../../clients/authentication/v2/types.js";

/**
 * Checks that a created request echoes what it was asked for and carries the fields
 * the vendor needs to take the customer through approval.
 *
 * @param {RequestSystemResponse} request - The created request.
 * @param {{systemId: string, partyOrgNo: string, externalRef: string}} expected - What the request was created with.
 * @returns {boolean} True if the request matches, false otherwise.
 */
function CheckRequestCreated(request, expected) {
    const required = ["id", "status", "confirmUrl"];
    const missing = required.filter((field) => request?.[field] === undefined || request?.[field] === null);

    const success = check(request, {
        "CheckRequestCreated - Request echoes the system, party and external ref": (created) =>
            created !== null &&
            created.systemId === expected.systemId &&
            created.partyOrgNo === expected.partyOrgNo &&
            created.externalRef === expected.externalRef,
        "CheckRequestCreated - Request carries id, status and confirm url": () => missing.length === 0,
    });

    if (!success) {
        console.error(`CheckRequestCreated - expected: ${JSON.stringify(expected)}`);
        if (missing.length > 0) {
            console.error(`CheckRequestCreated - missing fields: ${JSON.stringify(missing)}`);
        }
        console.error(`CheckRequestCreated - request returned: ${JSON.stringify(request)}`);
    }

    return success;
}

/**
 * Checks that a request has the expected status.
 *
 * @param {RequestSystemResponse} request - The request to check.
 * @param {string} expectedStatus - The status the request is expected to have.
 * @returns {boolean} True if the status matches, false otherwise.
 */
function CheckRequestStatus(request, expectedStatus) {
    const success = check(request, {
        [`CheckRequestStatus - Request has status '${expectedStatus}'`]: (created) =>
            created?.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckRequestStatus - expected status '${expectedStatus}', got '${request?.status}'`);
    }

    return success;
}

/**
 * Checks that a request was approved.
 *
 * @param {boolean} approved - Whether the approve call reported success.
 * @returns {boolean} True if the request was approved, false otherwise.
 */
function CheckRequestApproved(approved) {
    const success = check(approved, {
        "CheckRequestApproved - Request was approved": (result) => result === true,
    });

    if (!success) {
        console.error(`CheckRequestApproved - approve did not report success, got '${approved}'`);
    }

    return success;
}

export const SystemUserRequestDomainChecks = {
    CheckRequestCreated,
    CheckRequestStatus,
    CheckRequestApproved,
};
