import runSystemRegisterAccessPackages, { setup as setupSystemRegisterAccessPackages } from "./system-register-access-packages.js";
import runSystemRegisterCrud, { setup as setupSystemRegisterCrud } from "./system-register-crud.js";
import runSystemRegisterRights, { setup as setupSystemRegisterRights } from "./system-register-rights.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        systemRegisterAccessPackages: setupSystemRegisterAccessPackages(),
        systemRegisterCrud: setupSystemRegisterCrud(),
        systemRegisterRights: setupSystemRegisterRights(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 */
export default async function () {
    await runSystemRegisterAccessPackages();
    await runSystemRegisterCrud();
    await runSystemRegisterRights();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
