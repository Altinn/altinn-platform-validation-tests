import { setup as commonsSetup } from "./commons.js";
import runConsentLog from "./consent-log.js";
import runConsentLogWorstCase from "./consent-log-worst-case.js";
import runConsentRequests from "./consent-requests.js";
import runConsentRequestsWorstCase from "./consent-requests-worst-case.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commons: commonsSetup(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runConsentLogWorstCase();
    runConsentLog(data.commons);
    runConsentRequestsWorstCase();
    runConsentRequests(data.commons);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../../common-imports.js";
