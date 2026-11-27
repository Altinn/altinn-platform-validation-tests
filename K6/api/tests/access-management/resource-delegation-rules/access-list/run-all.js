import runAccessListDelegationCheck from "./access-list-delegation-check.js";
import runAccessListPerson from "./access-list-person.js";

export { setup } from "../common.js";

/**
 * Runs the scheduled tests in this folder once, in one k6 run.
 *
 * access-list-membership.js is left out, since it takes about an hour, and so
 * is access-list-service-owner-delegation.js, which fails until
 * Altinn/altinn-auth#4186 is fixed.
 *
 * @param {ReturnType<typeof import("../common.js").setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    runAccessListDelegationCheck(data);
    runAccessListPerson(data);
}
