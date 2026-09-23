import { check } from "k6";

import { AssignmentResourceDto } from "../../../../clients/access-management/service-owner/connections/connections.types.js";

/**
 * Checks that a resource delegation was created.
 *
 * The building block has already checked the status code and that the body
 * parsed, so what is left to say is whether the response carried an assignment
 * resource at all: a 200 with nothing in it is a delegation nothing can be said
 * about afterwards.
 *
 * The check name is a fixed string rather than one built per call site, so every
 * run reports it under the same series in Grafana.
 *
 * @param {AssignmentResourceDto|null} assignment The created assignment resource.
 * @returns {boolean} True if the delegation was created.
 */
function CheckResourceDelegationCreated(assignment) {
    const success = check(assignment, {
        "CheckResourceDelegationCreated - the delegation was created": (response) =>
            Boolean(response?.id),
    });

    if (!success) {
        console.error(
            `CheckResourceDelegationCreated - no assignment resource in the response: ${JSON.stringify(assignment)}`,
        );
    }

    return success;
}

export const ConnectionsDomainChecks = {
    CheckResourceDelegationCreated,
};
