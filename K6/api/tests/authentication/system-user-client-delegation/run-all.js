import runDelegateAndRemoveClient, { setup, teardown } from "./delegate-and-remove-client.js";

export { setup, teardown };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {object} data Whatever setup returned.
 */
export default function (data) {
    runDelegateAndRemoveClient(data);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
