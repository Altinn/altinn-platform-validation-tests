import runCreateResourceAndPolicy, { setup as createResourceAndPolicySetup } from "./create-resource-and-policy.js";
import runGetUpdatedResources, { setup as getUpdatedResourcesSetup } from "./get-updated-resources.js";

/**
 * Both tests only check their environment variables in setup and return nothing,
 * so there is no state to thread through to the default function.
 *
 */
export function setup() {
    getUpdatedResourcesSetup();
    createResourceAndPolicySetup();
}

/**
 * Runs every test in the folder. A third test in here goes in the list below.
 *
 */
export default function () {
    runGetUpdatedResources();
    runCreateResourceAndPolicy();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
