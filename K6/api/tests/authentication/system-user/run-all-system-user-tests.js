import { cleanupArranged } from "../change-request-system-user/commons.js";
import runCreateAndApproveChangeRequest from "../change-request-system-user/create-and-approve-change-request.js";
import { setup as setupChangeRequest } from "../change-request-system-user/create-and-approve-change-request.js";
import { setup as setupSystemUserRequest } from "../system-user-request/commons.js";
import runCreateAndConfirmSystemUserRequest, { teardown as teardownCreateAndConfirm } from "../system-user-request/create-and-confirm-system-user-request.js";
import runGetAgentSystemUserRequestsBySystemId from "../system-user-request/get-agent-system-user-requests-by-system-id.js";
import runGetSystemUserRequestsBySystemId from "../system-user-request/get-system-user-requests-by-system-id.js";
import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";

/**
 * k6 setup stage. Runs each test's own setup and keeps the results apart.
 *
 * The two create flows no longer take the same shape: the change request test
 * arranges a system user in its setup and hands its default function the ids,
 * while create-and-confirm takes the customers and the vendor its setup drew.
 *
 * @returns One entry per test that needs setup data.
 */
export function setup() {
    return {
        systemUserRequest: setupSystemUserRequest(),
        changeRequest: setupChangeRequest(),
    };
}

/**
 * Runs every system user test in sequence, so a change to the shared v2 clients
 * or building blocks can be verified with one k6 run instead of five.
 *
 * The two create flows only have test data on at22, so run this against at22.
 * The three read flows also pass on tt02.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runGetSystemUsersBySystemId();
    runGetSystemUserRequestsBySystemId();
    runGetAgentSystemUserRequestsBySystemId();
    runCreateAndConfirmSystemUserRequest(data.systemUserRequest);
    runCreateAndApproveChangeRequest(data.changeRequest);
}

/**
 * k6 teardown stage. Removes what the two create flows left behind.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export function teardown(data) {
    teardownCreateAndConfirm(data.systemUserRequest);
    cleanupArranged(data.changeRequest);
}

export { handleSummary } from "../../../../common-imports.js";
