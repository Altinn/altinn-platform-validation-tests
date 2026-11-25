import { check } from "k6";

import { RightCheckDto } from "../../../../clients/access-management/enduser/connections/connections.types.js";
import { sameSet } from "../../../../helpers.js";

/**
 * Finds the delegation check result for the right with an action.
 *
 * @param {RightCheckDto[]} rights - The rights returned by the resource delegation check.
 * @param {string} action - The action of the right, for example read.
 * @returns {RightCheckDto|undefined} The result, or undefined if no right has the action.
 */
function FindRight(rights, action) {
    return rights.find((rightCheck) => rightCheck.right?.action?.value === action);
}

/**
 * Checks that the resource delegation check returns one right for each of
 * the actions, and nothing else.
 *
 * @param {RightCheckDto[]} rights - The rights returned by the resource delegation check.
 * @param {Array<string>} expectedActions - The actions in the resource's policy, for example read and write.
 * @returns {boolean} True if exactly those actions are returned, false otherwise.
 */
function CheckRightsForActionsAreReturned(rights, expectedActions) {
    const actions = rights.map((rightCheck) => rightCheck.right?.action?.value ?? "");

    const success = check(actions, {
        "CheckRightsForActionsAreReturned - Resource delegation check returns a right for each action in the resource's policy": () =>
            sameSet(actions, expectedActions),
    });

    if (!success) {
        console.error(`CheckRightsForActionsAreReturned - expected: ${JSON.stringify(expectedActions)}`);
        console.error(`CheckRightsForActionsAreReturned - got: ${JSON.stringify(actions)}`);
    }

    return success;
}

/**
 * Checks that the user can delegate the right because it has been delegated
 * to them (reason DelegationAccess).
 *
 * @param {RightCheckDto[]} rights - The rights returned by the resource delegation check.
 * @param {string} action - The action of the right, for example read.
 * @returns {boolean} True if the right can be delegated through a delegation, false otherwise.
 */
function CheckRightCanBeDelegatedThroughDelegation(rights, action) {
    const rightCheck = FindRight(rights, action);

    const success = check(rightCheck, {
        "CheckRightCanBeDelegatedThroughDelegation - Right can be delegated because it was delegated to the user": (returned) =>
            returned?.result === true && (returned.reasonCodes ?? []).includes("DelegationAccess"),
    });

    if (!success) {
        console.error(`CheckRightCanBeDelegatedThroughDelegation - expected '${action}' to be delegable through a delegation, got: ${JSON.stringify(rightCheck ?? "not returned")}`);
    }

    return success;
}

/**
 * Checks that the right is returned and that the user cannot delegate it.
 *
 * @param {RightCheckDto[]} rights - The rights returned by the resource delegation check.
 * @param {string} action - The action of the right, for example read.
 * @returns {boolean} True if the right is returned with result false, false otherwise.
 */
function CheckRightCannotBeDelegated(rights, action) {
    const rightCheck = FindRight(rights, action);

    const success = check(rightCheck, {
        "CheckRightCannotBeDelegated - Right cannot be delegated": (returned) => returned?.result === false,
    });

    if (!success) {
        console.error(`CheckRightCannotBeDelegated - expected '${action}' not to be delegable, got: ${JSON.stringify(rightCheck ?? "not returned")}`);
    }

    return success;
}

export const ResourceDelegationCheckDomainChecks = {
    CheckRightsForActionsAreReturned,
    CheckRightCanBeDelegatedThroughDelegation,
    CheckRightCannotBeDelegated,
};
