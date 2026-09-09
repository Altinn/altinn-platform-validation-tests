import { check } from "k6";

import { AgentRequestSystemResponse, RequestSystemResponse } from "../../../clients/authentication/types.js";

/**
 * The part of a system user request that the Access Management BFF serves and the
 * checks below read.
 *
 * Described from what at22 answers rather than from the BFF swagger, which carries
 * no model for this response. Worth keeping apart from the vendor models above: the
 * BFF nests the system, where the vendor endpoints carry a flat `systemId`, and the
 * status comes through in authentication's words rather than the ones the BFF
 * swagger lists for `RequestStatus`.
 *
 * @typedef {object} BffSystemUserRequest
 * @property {string} [id] Request UUID.
 * @property {string} [status] Where the request stands: "New", "Accepted" or "Rejected".
 * @property {{systemId?: string}} [system] The system the request was made for.
 * @property {boolean} [userMayEscalateButNotApprove] True when the user who loaded the request may only pass it on to someone who can approve.
 */

/**
 * Checks that a created request echoes what it was asked for and carries the fields
 * the vendor needs to take the customer through approval.
 *
 * @param {RequestSystemResponse|AgentRequestSystemResponse|null} request - The created request. Either kind, since the checks below only read the fields both carry.
 * @param {{systemId: string, partyOrgNo: string, externalRef: string}} expected - What the request was created with.
 * @returns {boolean} True if the request matches, false otherwise.
 */
function CheckRequestCreated(request, expected) {
    const required = ["id", "status", "confirmUrl"];
    const fields = /** @type {{[field: string]: unknown}} */ (request ?? {});
    const missing = required.filter((field) => fields[field] === undefined || fields[field] === null);

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
 * @param {RequestSystemResponse|AgentRequestSystemResponse|null} request - The request to check.
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
 * Checks that an earlier step produced a system user request to act on.
 *
 * A group that needs one cannot say anything useful without it, so a caller that
 * gets false back should fail() and stop the run at the step that broke.
 *
 * @param {string|null|undefined} requestId - The request id the earlier step should have produced.
 * @returns {requestId is string} True if there is a request to act on, false otherwise.
 */
function CheckRequestId(requestId) {
    const success = check(requestId, {
        "CheckRequestId - An earlier step produced a system user request": (id) => {
            return id !== null && id !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckRequestId - expected a request id from an earlier step, got ${JSON.stringify(requestId)}`);
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

/**
 * Checks that a lookup found the request an earlier step created.
 *
 * @param {RequestSystemResponse|AgentRequestSystemResponse|null} request - The request the lookup returned.
 * @param {string|undefined} expectedId - Id of the request the earlier step created.
 * @returns {boolean} True if the lookup found that request, false otherwise.
 */
function CheckSameRequest(request, expectedId) {
    const success = check(request, {
        "CheckSameRequest - The lookup found the request that was created": (found) =>
            found !== null && found?.id === expectedId,
    });

    if (!success) {
        console.error(`CheckSameRequest - expected request '${expectedId}', got '${request?.id}'`);
    }

    return success;
}

/**
 * Checks that a system user request was withdrawn.
 *
 * @param {boolean} deleted - Whether the delete call reported success.
 * @returns {boolean} True if the request was withdrawn, false otherwise.
 */
function CheckRequestDeleted(deleted) {
    const success = check(deleted, {
        "CheckRequestDeleted - Request was withdrawn": (result) => result === true,
    });

    if (!success) {
        console.error(`CheckRequestDeleted - delete did not report success, got '${deleted}'`);
    }

    return success;
}

/**
 * Checks that a request carries the system it was made for.
 *
 * Read off the request the approver loaded, so a request that belongs to another
 * system than the one the test registered is caught before it is approved rather
 * than as a surprise further down.
 *
 * @param {BffSystemUserRequest|null} request - The request as the BFF served it.
 * @param {string} expectedSystemId - The system the request was made for.
 * @returns {boolean} True if the request carries that system, false otherwise.
 */
function CheckRequestSystem(request, expectedSystemId) {
    const success = check(request, {
        "CheckRequestSystem - Request carries the system it was made for": (loaded) =>
            loaded?.system?.systemId === expectedSystemId,
    });

    if (!success) {
        console.error(`CheckRequestSystem - expected system '${expectedSystemId}', got '${request?.system?.systemId}'`);
        console.error(`CheckRequestSystem - request returned: ${JSON.stringify(request)}`);
    }

    return success;
}

/**
 * Checks that the user who loaded the request is allowed to approve it.
 *
 * The BFF answers `userMayEscalateButNotApprove` true for a user who may only pass
 * the request on to someone who can approve it, so a request that is otherwise
 * ready is still not one this user can act on. Read before approving, since the
 * approval would only answer an error the check can say plainly.
 *
 * Only for system user requests. A change request cannot be escalated, so the BFF
 * serves no such field on one.
 *
 * @param {BffSystemUserRequest|null} request - The request as the BFF served it.
 * @returns {boolean} True if the user may approve, false otherwise.
 */
function CheckUserMayApprove(request) {
    const success = check(request, {
        "CheckUserMayApprove - The user may approve the request, not only escalate it": (loaded) =>
            loaded?.userMayEscalateButNotApprove === false,
    });

    if (!success) {
        console.error(`CheckUserMayApprove - userMayEscalateButNotApprove was '${request?.userMayEscalateButNotApprove}'`);
    }

    return success;
}

export const SystemUserRequestDomainChecks = {
    CheckRequestCreated,
    CheckRequestStatus,
    CheckRequestSystem,
    CheckUserMayApprove,
    CheckRequestApproved,
    CheckRequestId,
    CheckRequestDeleted,
    CheckSameRequest,
};
