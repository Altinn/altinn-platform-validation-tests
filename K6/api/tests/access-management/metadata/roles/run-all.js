import { setup as commonSetup } from "./common.js";
import runGetResources from "./get-resources.js";
import runGetRoleWithId from "./get-role-with-id.js";
import runGetRoles from "./get-roles.js";
import runGetRolesPackages from "./get-roles-packages.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        common: commonSetup(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 */
export default function () {
    runGetResources();
    runGetRoleWithId();
    runGetRolesPackages();
    runGetRoles();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../../common-imports.js";
