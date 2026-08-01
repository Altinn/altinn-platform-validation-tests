import http from "k6/http";

import { parseCsvData, requireEnv } from "../../../../helpers.js";
import runCreateAndApproveChangeRequest from "../change-request-system-user/create-and-approve-change-request.js";
import runCreateAndConfirmSystemUserRequest from "../system-user-request/create-and-confirm-system-user-request.js";
import runGetAgentSystemUserRequestsBySystemId from "../system-user-request/get-agent-system-user-requests-by-system-id.js";
import runGetSystemUserRequestsBySystemId from "../system-user-request/get-system-user-requests-by-system-id.js";
import runGetSystemUsersBySystemId from "./get-system-users-by-system-id.js";

/**
 * The two create flows each fetch this CSV in their own setup. Fetching it once
 * here and passing it down keeps the aggregate run to a single fetch.
 *
 * @returns {object[]} Parsed customer rows, one per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return parseCsvData(res.body);
}

/**
 * Runs every system user test in sequence, so a change to the shared v2 clients
 * or building blocks can be verified with one k6 run instead of five.
 *
 * The two create flows only have test data on at22, so run this against at22.
 * The three read flows also pass on tt02.
 *
 * @param {object[]} data Customer rows from setup.
 */
export default function (data) {
    runGetSystemUsersBySystemId();
    runGetSystemUserRequestsBySystemId();
    runGetAgentSystemUserRequestsBySystemId();
    runCreateAndConfirmSystemUserRequest(data);
    runCreateAndApproveChangeRequest(data);
}

export { handleSummary } from "../../../../common-imports.js";
