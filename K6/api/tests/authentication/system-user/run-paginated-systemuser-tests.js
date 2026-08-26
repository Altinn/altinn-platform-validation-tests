
import runGetAgentSystemUserRequestsBySystemId from "../system-user-request/get-agent-system-user-requests-by-system-id.js";
import runGetSystemUserRequestsBySystemId from "../system-user-request/get-system-user-requests-by-system-id.js";
import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";
import runStreamSystemUsers from "./stream-system-users.js";

/**
 * Run all system-user related pagination tests in sequence.
 */
export default function () {
    runGetSystemUsersBySystemId();
    runGetSystemUserRequestsBySystemId();
    runGetAgentSystemUserRequestsBySystemId();
    runStreamSystemUsers();
}

export { handleSummary } from "../../../../common-imports.js";
