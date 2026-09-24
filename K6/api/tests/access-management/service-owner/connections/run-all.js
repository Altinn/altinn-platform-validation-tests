import { setup } from "./common.js";
import runToOrganization, { teardown as teardownOrganization } from "./resource-delegation-to-organization.js";
import runToPerson, { teardown as teardownPerson } from "./resource-delegation-to-person.js";

export { setup };

/**
 * Runs the service owner resource delegation tests.
 *
 * @param {ReturnType<typeof setup>} data Test data returned by setup.
 * @returns {void}
 */
export default function (data) {
    runToOrganization(data);
    runToPerson(data);
}

/**
 * Cleans up after both tests.
 *
 * @param {ReturnType<typeof setup>} data Test data returned by setup.
 * @returns {void}
 */
export function teardown(data) {
    teardownOrganization(data);
    teardownPerson(data);
}
