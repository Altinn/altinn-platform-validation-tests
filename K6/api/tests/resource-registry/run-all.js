import runCreateResourceAndPolicy, { setup as setupCreateResourceAndPolicy } from "./create-resource-and-policy.js";
import runExportResources, { setup as setupExportResources } from "./export-resources.js";
import runGetUpdatedResources, { setup as setupGetUpdatedResources } from "./get-updated-resources.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings.
 *
 * @returns One entry per test that needs setup data.
 */
export function setup() {
    return {
        getUpdatedResources: setupGetUpdatedResources(),
        exportResources: setupExportResources(),
        createResourceAndPolicy: setupCreateResourceAndPolicy(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * Only the read flow is scheduled in prod, through healthcheck.yaml. This one
 * writes, so it stays out of that.
 */
export default function () {
    runGetUpdatedResources();
    runExportResources();
    runCreateResourceAndPolicy();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
