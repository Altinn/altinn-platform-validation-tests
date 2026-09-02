import runDelegateAndRemoveClient, { setup as setupDelegateAndRemoveClient, teardown as teardownDelegateAndRemoveClient } from "./delegate-and-remove-client.js";
import runDelegateClientAndCheckDecision, { setup as setupDelegateClientAndCheckDecision, teardown as teardownDelegateClientAndCheckDecision } from "./delegate-client-and-check-decision.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the agent system user it arranged.
 *
 * They cannot share one: the decision test needs an auditor, since the resource it
 * asks about is the one the auditor package covers, while the other one draws from
 * every kind of facilitator on purpose. The decision test also arranges nothing in
 * the environments it skips, so this setup can hand it an empty list.
 *
 * @returns One entry per test.
 */
export function setup() {
    return {
        delegateAndRemoveClient: setupDelegateAndRemoveClient(),
        delegateClientAndCheckDecision: setupDelegateClientAndCheckDecision(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runDelegateAndRemoveClient(data.delegateAndRemoveClient);
    runDelegateClientAndCheckDecision(data.delegateClientAndCheckDecision);
}

/**
 * k6 teardown stage. Removes the agent system users the setups arranged.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export function teardown(data) {
    teardownDelegateAndRemoveClient(data.delegateAndRemoveClient);
    teardownDelegateClientAndCheckDecision(data.delegateClientAndCheckDecision);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
