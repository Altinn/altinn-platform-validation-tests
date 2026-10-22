import { setup as commonSetup } from "./common.js";
import runGetActivityLogMetadata from "./get-activity-log-metadata.js";
import runGetConnectionsActivityLog from "./get-connections-activity-log.js";
import runGetConnectionsActivityLogFilterValues from "./get-connections-activity-log-filter-values.js";
import runGetMaskinportenActivityLog from "./get-maskinporten-activity-log.js";
import runGetMaskinportenActivityLogFilterValues from "./get-maskinporten-activity-log-filter-values.js";
import runGetRequestActivityLog from "./get-request-activity-log.js";
import runGetRequestActivityLogFilterValues from "./get-request-activity-log-filter-values.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        common: commonSetup(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runGetActivityLogMetadata();
    runGetConnectionsActivityLog(data.common);
    runGetConnectionsActivityLogFilterValues(data.common);
    runGetMaskinportenActivityLog(data.common);
    runGetMaskinportenActivityLogFilterValues(data.common);
    runGetRequestActivityLog(data.common);
    runGetRequestActivityLogFilterValues(data.common);
}
