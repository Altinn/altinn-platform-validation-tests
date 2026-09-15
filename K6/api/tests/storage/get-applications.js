import { check, group } from "k6";

import {
    GetApplication,
    GetApplicationsByOrg,
    GetTextResource,
} from "../../building-blocks/storage/index.js";
import { getSmokeOptions } from "../common/smoke.js";
import {
    getApplicationsClient,
    getStorageSmokeConfiguration,
    getTextsClient,
} from "./commons.js";

const listLabel = { step: "List applications by org" };
const applicationLabel = { step: "Get one application" };
const textLabel = { step: "Get a text resource" };

export const options = getSmokeOptions([listLabel, applicationLabel, textLabel]);

export function setup() {
    return getStorageSmokeConfiguration();
}

/**
 * Smoke test: the Applications and Texts clients build requests Storage accepts.
 *
 * Lists the service owner's applications, then reads one of them and its text
 * resource. The app is the configured one when `STORAGE_APP` is set, otherwise
 * the first app in the list.
 *
 * @param {ReturnType<typeof setup>} configuration Resolved test configuration.
 */
export default function (configuration) {
    const applicationsClient = getApplicationsClient();
    const textsClient = getTextsClient();

    const applications = group("List the org's applications", function () {
        return GetApplicationsByOrg(applicationsClient, configuration.org, listLabel);
    });

    const hasApplications = check(applications, {
        "GetApplicationsByOrg - org has at least one application": (list) => list.length > 0,
    });

    if (!hasApplications) {
        return;
    }

    const app = configuration.app ?? String(applications[0].id).split("/")[1];

    group("Get one application", function () {
        GetApplication(applicationsClient, configuration.org, app, applicationLabel);
    });

    group("Get the application's text resource", function () {
        GetTextResource(textsClient, configuration.org, app, configuration.language, textLabel);
    });
}
