import { group } from "k6";

import { QueryInstances } from "../../building-blocks/storage/index.js";
import { getSmokeOptions } from "../common/smoke.js";
import { getInstancesClient, getStorageSmokeConfiguration } from "./commons.js";

const queryLabel = { step: "Query instances" };

export const options = getSmokeOptions([queryLabel]);

export function setup() {
    return getStorageSmokeConfiguration();
}

/**
 * Smoke test: the Instances client builds a query Storage accepts.
 *
 * Asks for one instance owned by the service owner's apps, without data
 * elements, so the answer stays small whatever the environment holds.
 *
 * @param {ReturnType<typeof setup>} configuration Resolved test configuration.
 */
export default function (configuration) {
    const instancesClient = getInstancesClient();

    group("Query one instance for the org", function () {
        QueryInstances(
            instancesClient,
            { org: configuration.org, size: 1, includeDataElements: false },
            null,
            queryLabel,
        );
    });
}
