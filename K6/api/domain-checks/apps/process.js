import { check } from "k6";

import { AppProcessState } from "../../../clients/apps/apps.types.js";

/**
 * Checks that moving the process on submitted the instance.
 *
 * An instance is submitted when the process has reached its end event, which
 * process/next answers with by setting ended and endEvent and leaving no current task.
 *
 * @param {AppProcessState|null} processState - What process/next answered with.
 * @returns {boolean} True if the instance is submitted, false otherwise.
 */
function CheckInstanceSubmitted(processState) {
    const success = check(processState, {
        "CheckInstanceSubmitted - The process has reached its end event": (state) =>
            Boolean(state?.ended) && Boolean(state?.endEvent) && !state?.currentTask,
    });

    if (!success) {
        console.error(`CheckInstanceSubmitted - process state returned: ${JSON.stringify(processState)}`);
    }

    return success;
}

export const AppProcessDomainChecks = {
    CheckInstanceSubmitted,
};
