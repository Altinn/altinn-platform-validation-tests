import { check } from "k6";

/**
 * Checks that a value an earlier step was supposed to produce is actually there.
 *
 * Groups that depend on an earlier group used to open with a bare early return,
 * which reported a clean run when the prerequisite was missing. Call this instead,
 * and carry on regardless of the result: skipping the rest of the group would
 * change how many checks a run reports, and a run is only comparable to the one
 * before it if the count is fixed. The dependent steps then fail on their own
 * checks, which is the point.
 *
 * Callers must stay null safe for that to hold. Use optional chaining on anything
 * the missing value feeds into, so it degrades to undefined rather than throwing
 * and taking the whole iteration with it.
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
