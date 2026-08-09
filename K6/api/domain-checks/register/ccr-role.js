import { check } from "k6";

/**
 * Checks that Register stopped listing the customer after the role was removed in
 * ER.
 *
 * The caller has already waited for the propagation, so a false here means Register
 * still had the customer when the wait ran out, not that it was never going to
 * catch up.
 *
 * @param {boolean} propagated - Whether Register dropped the customer in time.
 * @param {string} ccrRole - The role under test, e.g. "revisor".
 * @returns {boolean} True if Register reflected the removal, false otherwise.
 */
function CheckRoleRemoved(propagated, ccrRole) {
    const success = check(propagated, {
        [`CheckRoleRemoved - Register dropped the ${ccrRole} customer`]: (result) =>
            result === true,
    });

    if (!success) {
        console.error(
            `CheckRoleRemoved - Register still listed the customer as ${ccrRole} when the wait ran out`,
        );
    }

    return success;
}

/**
 * Checks that Register lists the customer again after the role was put back in ER.
 *
 * This is the half that leaves the environment as the test found it, so a false
 * here means a customer is left short of a facilitator.
 *
 * @param {boolean} propagated - Whether Register listed the customer again in time.
 * @param {string} ccrRole - The role under test, e.g. "revisor".
 * @returns {boolean} True if Register reflected the add-back, false otherwise.
 */
function CheckRoleAddedBack(propagated, ccrRole) {
    const success = check(propagated, {
        [`CheckRoleAddedBack - Register lists the ${ccrRole} customer again`]: (result) =>
            result === true,
    });

    if (!success) {
        console.error(
            `CheckRoleAddedBack - Register had not listed the customer as ${ccrRole} again when the wait ran out`,
        );
    }

    return success;
}

export const CcrRoleDomainChecks = {
    CheckRoleRemoved,
    CheckRoleAddedBack,
};
