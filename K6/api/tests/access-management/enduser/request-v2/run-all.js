import runBeOmEnkeltrettighet, { teardown as teardownBeOmEnkeltrettighet } from "./be-om-enkeltrettighet.js";
import { setup } from "./common.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {ReturnType<typeof setup>} data Test data, one slice of pairs per VU.
 * @returns {void}
 */
export default function (data) {
    runBeOmEnkeltrettighet(data);
}

/**
 * Removes what setup made, once, however many tests ran.
 *
 * @param {ReturnType<typeof setup>} data Test data, one slice of pairs per VU.
 * @returns {void}
 */
export function teardown(data) {
    teardownBeOmEnkeltrettighet(data);
}
