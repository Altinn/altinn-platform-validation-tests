import runAccessListDelegationCheck from "./access-list-delegation-check.js";
import runAccessListPerson from "./access-list-person.js";
import runDelegationCheckDelegable from "./delegation-check-delegable.js";
import runDelegationCheckNotDelegable from "./delegation-check-not-delegable.js";
import runEnduserRequestDelegable from "./enduser-request-delegable.js";
import runEnduserRequestNotDelegable from "./enduser-request-not-delegable.js";
import runServiceOwnerConnectionsNotDelegable from "./service-owner-connections-not-delegable.js";
import runServiceOwnerRequestDelegable from "./service-owner-request-delegable.js";
import runServiceOwnerRequestNotDelegable from "./service-owner-request-not-delegable.js";

export { setup } from "./common.js";

/**
 * Runs the scheduled tests in this folder once, in one k6 run.
 *
 * The v2 request tests are left out, since v2 is not live in every environment
 * the folder runs in; functional.yaml schedules them where it is. The by-hand
 * tests are left out too: create-resources.js and delegable-flag-propagation.js
 * write to the registry, access-list-membership.js takes about an hour,
 * compare-registry-with-access-management.js asks about every resource in the
 * registry, and access-list-service-owner-delegation.js fails until
 * Altinn/altinn-auth#4186 is fixed.
 *
 * @param {ReturnType<typeof import("./common.js").setup>} data The test data read in setup.
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
    runAccessListDelegationCheck(data);
    runAccessListPerson(data);
}
