import { check } from "k6";

import { AssignmentResourceDto } from "../../../../clients/access-management/service-owner/connections/connections.types.js";

/**
 * Checks that the resource reported at least one delegable right.
 *
 * The rights endpoint answers 200 with an empty list for a resource whose policy
 * grants nothing, and for one that does not exist at all. Either way there is
 * nothing to put on a delegation, so this is what separates "the resource is not
 * set up" from "the delegation failed", which the create on its own cannot say.
 *
 * @param {Array<string>} rightKeys The right keys taken off the rights response.
 * @param {string} resource The resource the rights were asked for.
 * @returns {boolean} True if the resource has at least one delegable right.
 */
function CheckDelegableRightsFound(rightKeys, resource) {
    const success = check(rightKeys, {
        "CheckDelegableRightsFound - the resource has delegable rights": (keys) =>
            keys.length > 0,
    });

    if (!success) {
        console.error(
            `CheckDelegableRightsFound - no delegable rights on resource '${resource}', so there is nothing to delegate`,
        );
    }

    return success;
}

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
    CheckDelegableRightsFound,
    CheckResourceDelegationCreated,
};
