import { cleanupArranged } from "./commons.js";
import runGetSystemUserByQuery, { setup as setupGetSystemUserByQuery } from "./get-system-user-by-query.js";
import runGetSystemUsersBySystemId, { setup as setupGetSystemUsersBySystemId } from "./get-system-users-by-system-id.js";
import runUpdateSystemUser, { setup as setupUpdateSystemUser } from "./update-system-user.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the system user it arranged.
 *
 * @returns {object} One entry per test that needs setup data.
 */
export function setup() {
    return {
        getSystemUserByQuery: setupGetSystemUserByQuery(),
        getSystemUsersBySystemId: setupGetSystemUsersBySystemId(),
        updateSystemUser: setupUpdateSystemUser(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * The two files next to this one are aggregates of their own: they reach into
 * change-request-system-user and system-user-request as well, which is useful by
 * hand but is those folders' own run-all.js over again.
 *
 * @param {object} data Setup results, keyed per test.
 */
export default function (data) {
    runGetSystemUsersBySystemId();
    runGetSystemUserByQuery(data.getSystemUserByQuery);
    runUpdateSystemUser(data.updateSystemUser);
}

/**
 * k6 teardown stage. Removes the system users the setups arranged.
 *
 * @param {object} data Setup results, keyed per test.
 */
export function teardown(data) {
    cleanupArranged(data.getSystemUserByQuery);
    cleanupArranged(data.updateSystemUser);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
