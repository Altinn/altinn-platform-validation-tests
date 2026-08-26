import functionAppsReturn401 from "./function-apps-return-401.js";
import runTokenGenerators, { setup } from "./token-generators.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 */
export default async function () {
    await runTokenGenerators();
    functionAppsReturn401();
}
