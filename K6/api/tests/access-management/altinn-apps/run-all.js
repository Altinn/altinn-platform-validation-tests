import runInstanceDelegationCheck, { setup } from "./instance-delegation-check.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 */
export default function () {
    runInstanceDelegationCheck();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
