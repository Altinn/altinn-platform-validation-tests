import { group } from "k6";

import { AppGetByApp } from "../../building-blocks/events/app/index.js";
import { getSmokeOptions } from "../common/smoke.js";
import { getAppClient, getEventsSmokeConfiguration } from "./commons.js";

const byAppLabel = { step: "Get app events by app" };

export const options = getSmokeOptions([byAppLabel]);

export function setup() {
    return getEventsSmokeConfiguration();
}

/**
 * Smoke test: the App events client builds a request Events accepts.
 *
 * Asks for one event of the configured app, from the start of the log. An
 * app without events answers an empty list.
 *
 * @param {ReturnType<typeof setup>} configuration Resolved test configuration.
 */
export default function (configuration) {
    const appClient = getAppClient();

    group("Get one event for the app", function () {
        AppGetByApp(
            appClient,
            configuration.org,
            configuration.app,
            { after: "0", size: 1 },
            byAppLabel,
        );
    });
}
