import exec from "k6/execution";
import http from "k6/http";

import { BffAccessManagementApiClient } from "../../../../../clients/authorization/index.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../../../helpers.js";
import { DelegationExport } from "../../../../building-blocks/authorization/client-delegations/index.js";
import { getTokenOpts } from "./commons.js";

// Labels for different actions
const label = { step: "Export delegations" };

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// get k6 options
export const options = getOptions(
    [label],
);

/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {BffAccessManagementApiClient | undefined} */
let accessManagementApiClient = undefined;

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * BffAccessManagementApiClient,
 * PersonalTokenGenerator
 * ]} The initialized API clients and token generator.
 */
function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new PersonalTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (accessManagementApiClient == undefined) {
        accessManagementApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [accessManagementApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns TODO: description
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();

    const baseUrl =
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/delegation/${__ENV.ENVIRONMENT}`;

    const files = [
        "fullmakt-org-org.csv",
        "fullmakt-user-user.csv",
        "instance-delegation-org-user.csv",
        "instance-delegation-user-user.csv",
        "single-service-org-org.csv",
        "single-service-user-user.csv",
    ];

    const allData = files.flatMap(file => {
        const res = http.get(`${baseUrl}/${file}`,
            { tags: { action: "fetch-test-data" } });

        if (res.status !== 200) {
            throw new Error(
                `Could not load ${file}. Status: ${res.status}`
            );
        }

        return parseCsvData(res.body);
    });

    return segmentData(allData, numberOfVUs);
}

/**
 * Main function executed by each VU.
 *
 * @param segmentedData TODO: description
 */
export default function (segmentedData) {
    const [accessManagementApiClient, tokenGenerator] = getClients();
    const user = getItemFromList(segmentedData[exec.vu.idInTest - 1], randomize);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(user.userId, user.partyUuid));
    const queryParams = {
        partyUuid: user.orgUuid,
        includeSubunits: true,
    };
    DelegationExport(accessManagementApiClient, queryParams, label);
}
