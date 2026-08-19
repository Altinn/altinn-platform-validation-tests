import runOpenClientAdmin, { setup } from "./open-client-admin.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {object} data Whatever setup returned.
 */
export default function (data) {
    runOpenClientAdmin(data);
}
