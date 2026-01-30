import { group } from "k6";

import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";
import runGetSystemUserRequestsBySystemId from "../system-user-request/get-system-user-requests-by-system-id.js";
import runGetAgentSystemUserRequestsBySystemId from "../system-user-request/get-agent-system-user-requests-by-system-id.js";

/**
 * Run all system-user related pagination tests in sequence.
 */
export default function () {
    runGetSystemUsersBySystemId();
    runGetSystemUserRequestsBySystemId();
    runGetAgentSystemUserRequestsBySystemId();
}

export { handleSummary } from "../../../../common-imports.js";
