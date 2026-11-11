import { check } from "k6";

import { RequestDto, RequestStatusV2 } from "../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { sameSet } from "../../../../helpers.js";

/**
 * Checks that a request has the expected status.
 *
 * @param {RequestDto|null} request - The request, as a building block returned it.
 * @param {RequestStatusV2} expectedStatus - The status the request is expected to have.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the status matches, false otherwise.
 */
function CheckRequestStatus(request, expectedStatus, operation) {
    const success = check(request, {
        [`CheckRequestStatus - ${operation} request has status '${expectedStatus}'`]: (r) =>
            r?.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckRequestStatus - ${operation} expected status '${expectedStatus}', got '${request?.status}'`);
    }

    return success;
}

/**
 * Checks that the request asks for exactly the given right keys, no more and no
 * fewer. A request that silently dropped or added a key would still answer 200,
 * so the status check alone would not notice.
 *
 * @param {RequestDto|null} request - The request, as a building block returned it.
 * @param {Array<string>} expectedKeys - The right keys the request was created with.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the requested keys match, false otherwise.
 */
function CheckRequestedRightKeys(request, expectedKeys, operation) {
    const actual = request?.resource?.requestedRightKeys ?? [];

    const success = check(request, {
        [`CheckRequestedRightKeys - ${operation} request carries the requested right keys`]: () =>
            sameSet(actual, expectedKeys),
    });

    if (!success) {
        console.error(`CheckRequestedRightKeys - ${operation} expected ${JSON.stringify(expectedKeys)}, got ${JSON.stringify(actual)}`);
    }

    return success;
}

/**
 * Checks that exactly the given right keys were approved. Approving fewer keys
 * than were requested gives PartialApprove, and this is what says which ones
 * went through.
 *
 * @param {RequestDto|null} request - The request, as a building block returned it.
 * @param {Array<string>} expectedKeys - The right keys that were approved.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the approved keys match, false otherwise.
 */
function CheckApprovedRightKeys(request, expectedKeys, operation) {
    const actual = request?.resource?.approvedRightKeys ?? [];

    const success = check(request, {
        [`CheckApprovedRightKeys - ${operation} request carries the approved right keys`]: () =>
            sameSet(actual, expectedKeys),
    });

    if (!success) {
        console.error(`CheckApprovedRightKeys - ${operation} expected ${JSON.stringify(expectedKeys)}, got ${JSON.stringify(actual)}`);
    }

    return success;
}

/**
 * Checks that the request just created is among the ones the receiver lists. An
 * empty list is a valid 200, so without this the receiver could approve nothing
 * and the run would stay green.
 *
 * @param {Array<RequestDto>} received - The receiver's requests, as a building block returned them.
 * @param {string|undefined} requestId - Id of the request that was created.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the request is listed, false otherwise.
 */
function CheckRequestReceived(received, requestId, operation) {
    const success = check(received, {
        [`CheckRequestReceived - ${operation} lists the created request`]: (list) =>
            requestId !== undefined && list.some((r) => r?.id === requestId),
    });

    if (!success) {
        console.error(`CheckRequestReceived - ${operation} did not list request '${requestId}' among ${received.length} received`);
    }

    return success;
}

export const RequestV2DomainChecks = {
    CheckApprovedRightKeys,
    CheckRequestReceived,
    CheckRequestStatus,
    CheckRequestedRightKeys,
};
