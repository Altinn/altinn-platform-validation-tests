import runCreateAndApproveChangeRequest from "../change-request-system-user/create-and-approve-change-request.js";
import runCreateAndConfirmSystemUserRequest from "../system-user-request/create-and-confirm-system-user-request.js";
import runGetAgentSystemUserRequestsBySystemId from "../system-user-request/get-agent-system-user-requests-by-system-id.js";
import runGetSystemUserRequestsBySystemId from "../system-user-request/get-system-user-requests-by-system-id.js";
import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";

// Both create flows fetch the same customers, so either folder's setup serves the
// whole aggregate run.
export { setup } from "../system-user-request/commons.js";

/**
 * Runs every system user test in sequence, so a change to the shared v2 clients
 * or building blocks can be verified with one k6 run instead of five.
 *
 * The two create flows only have test data on at22, so run this against at22.
 * The three read flows also pass on tt02.
 *
 * @param {object[]} data Customers from setup.
 */
export default function (data) {
    runGetSystemUsersBySystemId();
    runGetSystemUserRequestsBySystemId();
    runGetAgentSystemUserRequestsBySystemId();
    runCreateAndConfirmSystemUserRequest(data);
    runCreateAndApproveChangeRequest(data);
}

export { handleSummary } from "../../../../common-imports.js";
