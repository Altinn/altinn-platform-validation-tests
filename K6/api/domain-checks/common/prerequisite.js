import { check } from "k6";

/**
 * Checks that a value an earlier step was supposed to produce is actually there.
 *
 * Groups that depend on an earlier group used to open with a bare early return,
 * which reported a clean run when the prerequisite was missing. Call this instead
 * and fail() on a false result, so the run stops at the step that actually broke
 * rather than reporting a cascade of failures downstream of it.
 *
 * The check has to stay. fail() on its own aborts the iteration but writes
 * nothing to the summary and leaves the exit code at zero, so the failure is
 * visible only in the logs. The check is what puts a line in the summary.
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
