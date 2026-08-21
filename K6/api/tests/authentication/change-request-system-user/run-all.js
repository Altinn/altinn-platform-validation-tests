import { cleanupArranged } from "./commons.js";
import runCreateAndApproveChangeRequest, { setup as setupCreateAndApprove } from "./create-and-approve-change-request.js";
import runCreateAndDeleteChangeRequest, { setup as setupCreateAndDelete } from "./create-and-delete-change-request.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the system user it arranged.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        createAndApprove: setupCreateAndApprove(),
        createAndDelete: setupCreateAndDelete(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per test.
 */
export default function (data) {
    runCreateAndApproveChangeRequest(data.createAndApprove);
    runCreateAndDeleteChangeRequest(data.createAndDelete);
}

/**
 * k6 teardown stage. Removes what each setup arranged.
 *
 * @param {object} data Setup results, keyed per test.
 */
export function teardown(data) {
    cleanupArranged(data.createAndApprove);
    cleanupArranged(data.createAndDelete);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
