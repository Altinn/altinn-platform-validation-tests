import { check } from "k6";

import { RequestSystemResponse, RequestSystemResponsePaginated } from "../../clients/authentication/v2/types.js";

/**
 * Checks that a paginated response has the fields the pagination relies on.
 *
 * @param {RequestSystemResponsePaginated} paginated - The paginated response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the response is shaped as expected, false otherwise.
 */
function CheckPaginatedShape(paginated, operation) {
    const success = check(paginated, {
        [`CheckPaginatedShape - ${operation} returns data and links`]: (response) => {
            return response !== null &&
                Array.isArray(response.data) &&
                response.links !== null &&
                response.links !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckPaginatedShape - ${operation} response was not shaped as expected: ${JSON.stringify(paginated)}`);
    }

    return success;
}

/**
 * Checks that a paginated response holds at least one item.
 *
 * @param {RequestSystemResponsePaginated} paginated - The paginated response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the response holds items, false otherwise.
 */
function CheckPaginatedNotEmpty(paginated, operation) {
    const success = check(paginated, {
        [`CheckPaginatedNotEmpty - ${operation} returns at least one item`]: (response) => {
            return Array.isArray(response?.data) && response.data.length > 0;
        },
    });

    if (!success) {
        console.error(`CheckPaginatedNotEmpty - ${operation} returned no items, so there is nothing to page through`);
        console.error(`CheckPaginatedNotEmpty - response: ${JSON.stringify(paginated)}`);
    }

    return success;
}

/**
 * Checks that every returned request belongs to the system that was asked for.
 *
 * @param {RequestSystemResponsePaginated} paginated - The paginated response.
 * @param {string} expectedSystemId - The system the requests were asked for.
 * @returns {boolean} True if every request belongs to the system, false otherwise.
 */
function CheckRequestsBelongToSystem(paginated, expectedSystemId) {
    const requests = paginated?.data ?? [];
    const foreign = requests.filter((request) => request.systemId !== expectedSystemId);

    const success = check(paginated, {
        "CheckRequestsBelongToSystem - Every request belongs to the expected system": () =>
            requests.length > 0 && foreign.length === 0,
    });

    if (!success) {
        console.error(`CheckRequestsBelongToSystem - expected every request to have systemId '${expectedSystemId}'`);
        console.error(`CheckRequestsBelongToSystem - requests for other systems: ${JSON.stringify(foreign.map((request) => request.systemId))}`);
    }

    return success;
}

/**
 * Checks that more than the first page was returned.
 *
 * @param {number} pages - Number of pages fetched, including the first one.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if more than one page was returned, false otherwise.
 */
function CheckMultiplePages(pages, operation) {
    const success = check(pages, {
        [`CheckMultiplePages - ${operation} returns more than one page`]: (count) => count > 1,
    });

    if (!success) {
        console.error(`CheckMultiplePages - ${operation} returned ${pages} page(s), expected more than one`);
    }

    return success;
}

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
    CheckPaginatedShape,
    CheckPaginatedNotEmpty,
    CheckRequestsBelongToSystem,
    CheckMultiplePages,
    CheckRequestCreated,
    CheckRequestStatus,
    CheckRequestApproved,
};
