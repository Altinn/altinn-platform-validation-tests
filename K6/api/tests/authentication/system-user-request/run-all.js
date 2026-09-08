import { setup as commonsSetup } from "./commons.js";
import runCreateAndConfirmSystemUserRequest, { teardown as teardownCreateAndConfirm } from "./create-and-confirm-system-user-request.js";
import runCreateAndDeleteAgentSystemUserRequest, { teardown as teardownCreateAndDeleteAgent } from "./create-and-delete-agent-system-user-request.js";
import runCreateAndDeleteSystemUserRequest, { teardown as teardownCreateAndDelete } from "./create-and-delete-system-user-request.js";
import runGetAgentSystemUserRequestsBySystemId, { setup as setupGetAgentSystemUserRequestsBySystemId } from "./get-agent-system-user-requests-by-system-id.js";
import runGetSystemUserRequestsBySystemId, { setup as setupGetSystemUserRequestsBySystemId } from "./get-system-user-requests-by-system-id.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * The three create flows share the customer list, so they share one setup.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commons: commonsSetup(),
        getAgentSystemUserRequestsBySystemId: setupGetAgentSystemUserRequestsBySystemId(),
        getSystemUserRequestsBySystemId: setupGetSystemUserRequestsBySystemId(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runCreateAndConfirmSystemUserRequest(data.commons);
    runCreateAndDeleteSystemUserRequest(data.commons);
    runCreateAndDeleteAgentSystemUserRequest(data.commons);
    runGetAgentSystemUserRequestsBySystemId();
    runGetSystemUserRequestsBySystemId();
}

/**
 * k6 teardown stage. Runs the teardown of every test that has one, so a folder run
 * leaves the register as it found it.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export function teardown(data) {
    teardownCreateAndConfirm(data.commons);
    teardownCreateAndDelete(data.commons);
    teardownCreateAndDeleteAgent(data.commons);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
