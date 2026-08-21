import runGetSystemUsersBySystemId, { setup } from "./get-system-users-by-system-id.js";

export { setup };

/**
 * Runs the tests that live in this folder, which is the one read flow.
 *
 * The two files next to this one are aggregates of their own: they reach into
 * change-request-system-user and system-user-request as well, which is useful by
 * hand but is those folders' own run-all.js over again.
 */
export default function () {
    runGetSystemUsersBySystemId();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
