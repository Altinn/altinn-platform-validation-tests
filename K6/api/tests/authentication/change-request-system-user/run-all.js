import { cleanupArranged } from "./commons.js";
import runCreateAndApproveChangeRequest, { setup as setupCreateAndApprove } from "./create-and-approve-change-request.js";
import runCreateAndDeleteChangeRequest, { setup as setupCreateAndDelete } from "./create-and-delete-change-request.js";
import runGetChangeRequestsBySystemId, { setup as setupGetBySystemId } from "./get-change-requests-by-system-id.js";
import runListChangeRequestsBySystem, { setup as setupListBySystem } from "./list-change-requests-by-system.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the system user it arranged.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        createAndApprove: setupCreateAndApprove(),
        createAndDelete: setupCreateAndDelete(),
        listBySystem: setupListBySystem(),

        // Arranges nothing, it only checks the environment. Called anyway so a
        // missing url fails here rather than halfway through the run.
        getBySystemId: setupGetBySystemId(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runCreateAndApproveChangeRequest(data.createAndApprove);
    runCreateAndDeleteChangeRequest(data.createAndDelete);
    runListChangeRequestsBySystem(data.listBySystem);
    runGetChangeRequestsBySystemId();
}

/**
 * k6 teardown stage. Removes what each setup arranged.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export function teardown(data) {
    cleanupArranged(data.createAndApprove);
    cleanupArranged(data.createAndDelete);
    cleanupArranged(data.listBySystem);

    // Nothing for get-change-requests-by-system-id.js: it reads a seeded system
    // that has to outlive the run, so there is nothing of its own to remove.
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
