import runGetRegisteredSystems, { setup as setupGetRegisteredSystems } from "./get-registered-systems.js";
import runSystemRegisterAccessPackages, { setup as setupSystemRegisterAccessPackages, teardown as teardownSystemRegisterAccessPackages } from "./system-register-access-packages.js";
import runSystemRegisterCrud, { setup as setupSystemRegisterCrud, teardown as teardownSystemRegisterCrud } from "./system-register-crud.js";
import runSystemRegisterRights, { setup as setupSystemRegisterRights, teardown as teardownSystemRegisterRights } from "./system-register-rights.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        getRegisteredSystems: setupGetRegisteredSystems(),
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
    runGetRegisteredSystems();
    await runSystemRegisterAccessPackages();
    await runSystemRegisterCrud();
    await runSystemRegisterRights();
}

/**
 * k6 teardown stage. Runs the teardown of every test in the folder, so a run leaves
 * the register as it found it.
 */
export async function teardown() {
    await teardownSystemRegisterCrud();
    await teardownSystemRegisterRights();
    await teardownSystemRegisterAccessPackages();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
