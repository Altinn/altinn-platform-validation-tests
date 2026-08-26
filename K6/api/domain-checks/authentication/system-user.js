import { check } from "k6";

import { SystemUser } from "../../../clients/authentication/types.js";

/**
 * Checks that a lookup found the expected system user.
 *
 * @param {SystemUser|null} systemUser - The system user the lookup returned.
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

/**
 * Checks that the setup produced a system user to act on.
 *
 * The arrange stops at the step that broke rather than failing the run, so this is
 * where an arrange that got nowhere surfaces. A caller that gets false back should
 * fail(): failing here rather than in the setup is what lets the teardown remove
 * what the arrange did manage to create.
 *
 * @param {string|undefined} systemUserId - The system user the setup should have produced.
 * @returns {boolean} True if there is a system user to act on, false otherwise.
 */
function CheckSystemUserArranged(systemUserId) {
    const success = check(systemUserId, {
        "CheckSystemUserArranged - The setup produced a system user": (id) =>
            id !== null && id !== undefined,
    });

    if (!success) {
        console.error(`CheckSystemUserArranged - expected a system user from the setup, got ${JSON.stringify(systemUserId)}`);
    }

    return success;
}

export const SystemUserDomainChecks = {
    CheckSystemUserArranged,
    CheckSystemUserFound,
};
