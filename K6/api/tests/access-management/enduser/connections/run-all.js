import { setup as commonFunctionsSetup } from "./common-functions.js";
import runGetAccessPackagesFrom from "./get-access-packages-from.js";
import runGetAccessPackagesTo from "./get-access-packages-to.js";
import runGetConnectionsFrom from "./get-connections-from.js";
import runGetConnectionsTo from "./get-connections-to.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commonFunctions: commonFunctionsSetup(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default function (data) {
    runGetAccessPackagesFrom(data.commonFunctions);
    runGetAccessPackagesTo(data.commonFunctions);
    runGetConnectionsFrom(data.commonFunctions);
    runGetConnectionsTo(data.commonFunctions);
}
