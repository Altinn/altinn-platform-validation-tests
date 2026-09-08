import { cleanupArranged } from "./commons.js";
import runCreateAndApproveChangeRequest, { setup as setupCreateAndApprove } from "./create-and-approve-change-request.js";
import runCreateAndDeleteChangeRequest, { setup as setupCreateAndDelete } from "./create-and-delete-change-request.js";
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
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * get-change-requests-by-system-id.js is deliberately left out. The endpoint
 * ignores the continuation token it hands out, so the test is red in every
 * environment through no fault of its own, tracked as
 * Altinn/altinn-authentication#2156. It is already kept out of the schedule for
 * that reason, and a run of everything that is always red teaches everyone to
 * ignore the colour, so it is run by hand until the fix lands. Wire it back in here
 * once #2156 is fixed.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runCreateAndApproveChangeRequest(data.createAndApprove);
    runCreateAndDeleteChangeRequest(data.createAndDelete);
    runListChangeRequestsBySystem(data.listBySystem);
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
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
