import runBeOmEnkeltrettighet from "./be-om-enkeltrettighet.js";
import { setup } from "./common.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {ReturnType<typeof setup>} data Test data from setup.
 * @returns {void}
 */
export default function (data) {
    runBeOmEnkeltrettighet(data);
}
