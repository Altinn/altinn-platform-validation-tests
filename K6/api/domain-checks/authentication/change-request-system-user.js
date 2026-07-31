import { check } from "k6";

import { ChangeRequestResponse } from "../../../clients/authentication/v2/types.js";
import { missingRights } from "../common/rights.js";

/**
 * Checks that a change request was created for the expected system user and holds the
 * fields the vendor needs to take the customer through approval.
 *
 * @param {ChangeRequestResponse} changeRequest - The created change request.
 * @param {{systemId: string, partyOrgNo: string, systemUserId: string}} expected - What the change request was created for.
 * @returns {boolean} True if the change request matches, false otherwise.
 */
function CheckChangeRequestCreated(changeRequest, expected) {
    const success = check(changeRequest, {
        "CheckChangeRequestCreated - Change request is for the expected system user": (created) =>
            created !== null &&
            created.systemId === expected.systemId &&
            created.partyOrgNo === expected.partyOrgNo &&
            created.systemUserId === expected.systemUserId,
        "CheckChangeRequestCreated - Change request carries id and confirm url": (created) =>
            created?.id !== undefined &&
            created?.id !== null &&
            typeof created?.confirmUrl === "string" &&
            created.confirmUrl.length > 0,
    });

    if (!success) {
        console.error(`CheckChangeRequestCreated - expected: ${JSON.stringify(expected)}`);
        console.error(`CheckChangeRequestCreated - change request returned: ${JSON.stringify(changeRequest)}`);
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
    CheckChangeRequestCreated,
    CheckChangeRequestStatus,
    CheckChangeRequestRequiredRights,
    CheckChangeRequestIsEmpty,
    CheckChangeRequestApproved,
};
