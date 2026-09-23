import { getOptions } from "../../../../../helpers.js";
import { LABELS, revokeDelegations, runResourceDelegation, setup } from "./common.js";

export { setup };

export const options = getOptions(LABELS);

/**
 * Test: the service owner delegates the resource to an organization.
 *
 * A sibling of resource-delegation-to-person.js. One test per recipient type
 * rather than one test drawing both, so a functional run covers each case
 * whatever the iteration count is.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    runResourceDelegation(data, "organization");
}

/**
 * Removes any organization delegation the run left behind.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export function teardown(data) {
    revokeDelegations(data, "organization");
}
