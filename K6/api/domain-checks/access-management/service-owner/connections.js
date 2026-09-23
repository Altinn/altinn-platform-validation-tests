import { check } from "k6";

import { AssignmentResourceDto } from "../../../../clients/access-management/service-owner/connections/connections.types.js";

/**
 * Matches the identifiers the API hands back, which are UUIDv7 values.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks that a resource delegation was created and reported back in full.
 *
 * A create answers 200 with the assignment resource it made, as three
 * identifiers: its own `id`, the `assignmentId` of the assignment it belongs to,
 * and the `resourceId` of the resource delegated. A 200 carrying a body missing
 * any of them is a delegation nothing can be said about afterwards, which is
 * what this separates from a delegation that actually landed.
 *
 * @param {AssignmentResourceDto|null} assignment The created assignment resource.
 * @param {string} operation Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the delegation was created and fully reported.
 */
function CheckResourceDelegationCreated(assignment, operation) {
    const missing = [
        ["id", assignment?.id],
        ["assignmentId", assignment?.assignmentId],
        ["resourceId", assignment?.resourceId],
    ]
        .filter(([, value]) => !UUID.test(String(value ?? "")))
        .map(([field]) => field);

    const success = check(assignment, {
        [`CheckResourceDelegationCreated - ${operation} created the delegation`]: (response) =>
            response !== null && missing.length === 0,
    });

    if (!success) {
        console.error(
            `CheckResourceDelegationCreated - ${operation} did not report a complete assignment resource`,
        );
        console.error(
            `CheckResourceDelegationCreated - missing or malformed: ${JSON.stringify(missing)}`,
        );
        console.error(
            `CheckResourceDelegationCreated - body: ${JSON.stringify(assignment)}`,
        );
    }

    return success;
}

export const ConnectionsDomainChecks = {
    CheckResourceDelegationCreated,
};
