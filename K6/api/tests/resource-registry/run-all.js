import runGetResourceList, { setup as setupGetResourceList } from "./get-resource-list.js";
import runGetUpdatedResources, { setup as setupGetUpdatedResources } from "./get-updated-resources.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings.
 *
 * @returns One entry per test that needs setup data.
 */
export function setup() {
    return {
        getUpdatedResources: setupGetUpdatedResources(),
        getResourceList: setupGetResourceList(),
    };
}

/**
 * Runs the read tests in this folder once, in one k6 run, so a change to the
 * shared clients, building blocks or checks can be verified in one go.
 *
 * create-resource-and-policy.js is deliberately left out. Deleting a resource
 * leaves its rows in resourceregistry.resourcesubjects behind with deleted set
 * to false, and nothing cleans them up, reported as
 * Altinn/altinn-resource-registry#848 and concluded in #488. Every run of that
 * test therefore leaks a couple of rows, so it has to be started on purpose
 * rather than swept along by a run of everything. Wire it back in here once #848
 * is fixed.
 */
export default function () {
    runGetUpdatedResources();
    runGetResourceList();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
