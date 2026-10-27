import { setup as commonSetup } from "./common.js";
import runGetConnectionsActivityLogFilterValues from "./get-connections-activity-log-filter-values.js";
import runGetConnectionsActivityLogFrom from "./get-connections-activity-log-from.js";
import runGetConnectionsActivityLogMetadata from "./get-connections-activity-log-metadata.js";
import runGetConnectionsActivityLogTo from "./get-connections-activity-log-to.js";
import runGetMaskinportenActivityLogFilterValues from "./get-maskinporten-activity-log-filter-values.js";
import runGetMaskinportenActivityLogFrom from "./get-maskinporten-activity-log-from.js";
import runGetMaskinportenActivityLogMetadata from "./get-maskinporten-activity-log-metadata.js";
import runGetMaskinportenActivityLogTo from "./get-maskinporten-activity-log-to.js";
import runGetRequestActivityLogFilterValues from "./get-request-activity-log-filter-values.js";
import runGetRequestActivityLogFrom from "./get-request-activity-log-from.js";
import runGetRequestActivityLogMetadata from "./get-request-activity-log-metadata.js";
import runGetRequestActivityLogTo from "./get-request-activity-log-to.js";

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
    runGetConnectionsActivityLogTo(data.common);
    runGetConnectionsActivityLogFrom(data.common);
    runGetConnectionsActivityLogFilterValues(data.common);
    runGetConnectionsActivityLogMetadata();
    runGetMaskinportenActivityLogTo(data.common);
    runGetMaskinportenActivityLogFrom(data.common);
    runGetMaskinportenActivityLogFilterValues(data.common);
    runGetMaskinportenActivityLogMetadata();
    runGetRequestActivityLogTo(data.common);
    runGetRequestActivityLogFrom(data.common);
    runGetRequestActivityLogFilterValues(data.common);
    runGetRequestActivityLogMetadata();
}
