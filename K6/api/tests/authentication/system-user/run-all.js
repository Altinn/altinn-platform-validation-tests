import { cleanupArranged } from "./commons.js";
import runGetSystemUserByQuery, { setup as setupGetSystemUserByQuery } from "./get-system-user-by-query.js";
import runGetSystemUsersBySystemId, { setup as setupGetSystemUsersBySystemId } from "./get-system-users-by-system-id.js";
import runStreamSystemUsers, { setup as setupStreamSystemUsers } from "./stream-system-users.js";
import runSystemUserDecision, { setup as setupSystemUserDecision } from "./system-user-decision.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the system user it arranged.
 *
 * @returns One entry per test that needs setup data.
 */
export function setup() {
    return {
        getSystemUserByQuery: setupGetSystemUserByQuery(),
        getSystemUsersBySystemId: setupGetSystemUsersBySystemId(),
        streamSystemUsers: setupStreamSystemUsers(),
        systemUserDecision: setupSystemUserDecision(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * The two files next to this one are aggregates of their own: they reach into
 * change-request-system-user and system-user-request as well, which is useful by
 * hand but is those folders' own run-all.js over again.
 *
 * system-with-created-resource.js is deliberately left out. It creates a resource
 * in the resource registry, and deleting a resource leaves its rows in
 * resourceregistry.resourcesubjects behind with deleted set to false, with nothing
 * cleaning them up, reported as Altinn/altinn-resource-registry#848 and concluded
 * in #488. Every run leaks a couple of rows, so it has to be started on purpose
 * rather than swept along by a run of everything. Wire it back in here once #848
 * is fixed.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runGetSystemUsersBySystemId();
    runGetSystemUserByQuery(data.getSystemUserByQuery);
    runSystemUserDecision(data.systemUserDecision);

    // Last: the stream fail()s on a first page it cannot read, and that ends the
    // whole iteration.
    runStreamSystemUsers();
}

/**
 * k6 teardown stage. Removes the system users the setups arranged.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export function teardown(data) {
    cleanupArranged(data.getSystemUserByQuery);
    cleanupArranged(data.systemUserDecision);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
