import { check } from "k6";

/**
 * Checks that an update of a system user was accepted.
 *
 * The endpoint answers 200 with no body, and the service currently persists
 * nothing, so accepted is all there is to check: reading the system user back
 * would return the title it already had. See UpdateSystemUserById in
 * altinn-authentication, where the write is commented out.
 *
 * @param {boolean} updated - Whether the update call reported success.
 * @returns {boolean} True if the update was accepted, false otherwise.
 */
function CheckSystemUserUpdated(updated) {
    const success = check(updated, {
        "CheckSystemUserUpdated - The update was accepted": (result) => result === true,
    });

    if (!success) {
        console.error(`CheckSystemUserUpdated - update did not report success, got '${updated}'`);
    }

    return success;
}

/**
 * Checks that a lookup found the expected system user.
 *
 * @param {SystemUser} systemUser - The system user the lookup returned.
 * @param {{id: string, systemId: string}} expected - The system user the lookup was made for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the lookup found that system user, false otherwise.
 */
function CheckSystemUserFound(systemUser, expected, operation) {
    const success = check(systemUser, {
        [`CheckSystemUserFound - ${operation} found the expected system user`]: (found) =>
            found !== null &&
            found?.id === expected.id &&
            found?.systemId === expected.systemId,
    });

    if (!success) {
        console.error(`CheckSystemUserFound - ${operation} expected: ${JSON.stringify(expected)}`);
        console.error(`CheckSystemUserFound - ${operation} returned: ${JSON.stringify(systemUser)}`);
    }

    return success;
}

export const SystemUserDomainChecks = {
    CheckSystemUserFound,
    CheckSystemUserUpdated,
};
