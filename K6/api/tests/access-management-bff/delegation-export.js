import exec from "k6/execution";
import http from "k6/http";

import { DelegationExportClient as BffDelegationExportClient } from "../../../clients/access-management-bff/delegation-export/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { GetDelegationExport } from "../../building-blocks/access-management-bff/delegation-export/index.js";
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
/** @type {BffDelegationExportClient | undefined} */
let accessManagementApiClient = undefined;

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * BffDelegationExportClient,
 * PersonalTokenGenerator
 * ]} The initialized API clients and token generator.
 */
function getClients() {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.PDP.AUTHORIZE.ENDUSER
        ]);

        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (accessManagementApiClient == undefined) {
        accessManagementApiClient = new BffDelegationExportClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
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
    GetDelegationExport(accessManagementApiClient, queryParams, label);
}
