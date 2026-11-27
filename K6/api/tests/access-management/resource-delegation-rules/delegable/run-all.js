import runDelegationCheckDelegable from "./delegation-check-delegable.js";
import runDelegationCheckNotDelegable from "./delegation-check-not-delegable.js";
import runEnduserRequestDelegable from "./enduser-request-delegable.js";
import runEnduserRequestNotDelegable from "./enduser-request-not-delegable.js";
import runServiceOwnerConnectionsNotDelegable from "./service-owner-connections-not-delegable.js";
import runServiceOwnerRequestDelegable from "./service-owner-request-delegable.js";
import runServiceOwnerRequestNotDelegable from "./service-owner-request-not-delegable.js";

export { setup } from "../common.js";

/**
 * Runs the tests in this folder once, in one k6 run.
 *
 * The v2 request tests are left out, since v2 is not live in every environment
 * this folder runs in; functional.yaml schedules them where it is.
 *
 * @param {ReturnType<typeof import("../common.js").setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    runDelegationCheckNotDelegable(data);
    runDelegationCheckDelegable(data);
    runServiceOwnerConnectionsNotDelegable(data);
    runEnduserRequestNotDelegable(data);
    runEnduserRequestDelegable(data);
    runServiceOwnerRequestNotDelegable(data);
    runServiceOwnerRequestDelegable(data);
}
