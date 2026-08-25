import runGetMyClients, { setup } from "./get-my-clients.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 */
export default function () {
    runGetMyClients();
}
