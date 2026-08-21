import exec from "k6/execution";

import { DelegationExportClient, GetDelegationExportQueryBuilder } from "../../../../clients/access-management-bff/delegation-export/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { GetDelegationExport } from "../../../building-blocks/access-management-bff/delegation-export/index.js";
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
/** @type {DelegationExportClient | undefined} */
let delegationExportApiClient = undefined;

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * DelegationExportClient,
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
    if (delegationExportApiClient == undefined) {
        delegationExportApiClient = new DelegationExportClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [delegationExportApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations to export delegations for, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();

    const files = [
        "fullmakt-org-org.csv",
        "fullmakt-user-user.csv",
        "instance-delegation-org-user.csv",
        "instance-delegation-user-user.csv",
        "single-service-org-org.csv",
        "single-service-user-user.csv",
    ];

    const allData = files.flatMap(file => {
        return fetchTestData(`access-management-bff/export/${__ENV.ENVIRONMENT}/${file}`);
    });

    return segmentData(allData, numberOfVUs);
}

/**
 * Main function executed by each VU.
 *
 * @param {any[][]} segmentedData Organizations to export delegations for, one slice per VU.
 */
export default function (segmentedData) {
    const [delegationExportApiClient, tokenGenerator] = getClients();
    const user = getItemFromList(segmentedData[exec.vu.idInTest - 1], randomize);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(user.userId, user.partyUuid));
    const queryParams = new GetDelegationExportQueryBuilder()
        .withPartyUuid(user.orgUuid)
        .withIncludeSubunits(true)
        .build();
    GetDelegationExport(delegationExportApiClient, queryParams, label);
}
