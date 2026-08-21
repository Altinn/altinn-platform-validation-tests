import { setup as commonFunctionsSetup } from "./common-functions.js";
import runDagl from "./dagl.js";
import runDaglDeny from "./dagl-deny.js";
import runDaglDirectDelegation from "./dagl-direct-delegation.js";
import runDaglSingleResource, { setup as setupDaglSingleResource } from "./dagl-single-resource.js";
import runEnduser from "./enduser.js";
import runEnduserEnduserInstances, { setup as setupEnduserEnduserInstances } from "./enduser-enduser-instances.js";
import runOrgEnduserInstances, { setup as setupOrgEnduserInstances } from "./org-enduser-instances.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commonFunctions: commonFunctionsSetup(),
        daglSingleResource: setupDaglSingleResource(),
        enduserEnduserInstances: setupEnduserEnduserInstances(),
        orgEnduserInstances: setupOrgEnduserInstances(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default function (data) {
    runDaglDeny(data.commonFunctions);
    runDaglDirectDelegation(data.commonFunctions);
    runDaglSingleResource(data.daglSingleResource);
    runDagl(data.commonFunctions);
    runEnduserEnduserInstances(data.enduserEnduserInstances);
    runEnduser(data.commonFunctions);
    runOrgEnduserInstances(data.orgEnduserInstances);
}
