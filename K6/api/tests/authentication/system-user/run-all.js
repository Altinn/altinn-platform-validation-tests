import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";
import runSystemWithCreatedResource from "./system-with-created-resource.js";

export { setup } from "./commons.js";

/**
 * Runs the tests that live in this folder: the read flow, and the one that
 * creates its own resource before registering a system on it.
 *
 * The two other files next to this one are aggregates of their own: they reach
 * into change-request-system-user and system-user-request as well, which is
 * useful by hand but is those folders' own run-all.js over again.
 */
export default function () {
    runGetSystemUsersBySystemId();
    runSystemWithCreatedResource();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
