import runResourceDelegation, { setup } from "./resource-delegation.js";

export { setup };

/**
 * Runs the service owner resource delegation tests.
 *
 * @param {ReturnType<typeof setup>} data Test data returned by setup.
 */
export default function (data) {
    runResourceDelegation(data);
}
