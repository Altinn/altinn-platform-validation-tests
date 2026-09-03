export { handleSummary } from "../../../../../common-imports.js";
import runDelegateAndRemoveResource, { setup as setupDelegateAndRemoveResource, teardown as teardownDelegateAndRemoveResource } from "./delegate-and-remove-resource.js";

export { setupDelegateAndRemoveResource as setup };

/**
 * Runs every client delegation v2 test in this folder once.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export default function (data) {
    runDelegateAndRemoveResource(data);
}

/**
 * Cleans up after every test in this folder.
 *
 * k6 calls one teardown per script, so a scenario added here has to be swept
 * from this function too. Forgetting that leaves its writes behind, and the
 * summary says nothing about it.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export function teardown(data) {
    teardownDelegateAndRemoveResource(data);
}
