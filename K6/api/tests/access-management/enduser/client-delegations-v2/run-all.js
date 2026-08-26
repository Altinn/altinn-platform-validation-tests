export { handleSummary } from "../../../../../common-imports.js";
import runDelegateAndRemoveResource, { setup as setupDelegateAndRemoveResource } from "./delegate-and-remove-resource.js";

export { setupDelegateAndRemoveResource as setup };

/**
 * Runs every client delegation v2 test in this folder once.
 *
 * @param {{party: string, resourceRefId: string}} data What the setup arranged.
 * @returns {void}
 */
export default function (data) {
    runDelegateAndRemoveResource(data);
}
