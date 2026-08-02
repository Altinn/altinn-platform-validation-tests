import { check } from "k6";

/**
 * Checks that a value an earlier step was supposed to produce is actually there.
 *
 * Groups that depend on an earlier group used to open with a bare early return,
 * which reported a clean run when the prerequisite was missing. Use this instead,
 * so the missing value shows up in the summary, and return when it fails so the
 * dependent steps skip rather than throwing on a null.
 *
 * @param {unknown} value - The value the earlier step should have produced.
 * @param {string} description - What the value is, used in the check name and logs.
 * @returns {boolean} True if the value is present, false otherwise.
 */
function CheckPrerequisite(value, description) {
    const success = check(value, {
        [`CheckPrerequisite - ${description}`]: (subject) => {
            return subject !== null && subject !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckPrerequisite - ${description}: expected a value from an earlier step, got ${JSON.stringify(value)}`);
    }

    return success;
}

export const PrerequisiteDomainChecks = {
    CheckPrerequisite,
};
