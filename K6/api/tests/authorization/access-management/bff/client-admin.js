/**
 * Performance test for client administration in the authorization service.
 * This test simulates the actions browser actions for opening the client administrator,
 * including retrieving connections/rightholders, agents, clients, and delegation checks.
 * The test data is segmented for each VU to ensure that each virtual user operates on a unique set of data.
 * The test includes options for randomizing data selection and is designed to run in different environments based on the provided environment variables.
 * The test uses a personal token generator to authenticate requests and interacts with the BFF API clients for connections, client delegations, and access packages.
 */

import { group } from "k6";
import exec from "k6/execution";
import http from "k6/http";

import { BffAccessPackageApiClient, BffClientDelegationsApiClient, BffConnectionsApiClient } from "../../../../../clients/authorization/index.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../../../helpers.js";
import { GetDelegationCheck } from "../../../../building-blocks/authorization/access-package/delegate.js";
import { GetAgents, GetClients } from "../../../../building-blocks/authorization/client-delegations/index.js";
import { GetConnections } from "../../../../building-blocks/authorization/connections/index.js";
import { getTokenOpts } from "./commons.js";

// Labels for different actions
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };
const groupLabelValue = "Open client administration";

const getConnectionsLabel = { step: `1. ${BffConnectionsApiClient.TAGS.GetConnections.action}` };
const getAgentsLabel = { step: `2. ${BffClientDelegationsApiClient.TAGS.GetAgents.action}` };
const getClientsLabel = { step: `3. ${BffClientDelegationsApiClient.TAGS.GetClients.action}` };
const getDelegationCheckLabel = { step: `4. ${BffAccessPackageApiClient.TAGS.GetDelegationCheck.action}` };

/**
 * Whether test data should be randomized.
 *
 * Defaults to `true` when the `RANDOMIZE` environment variable is not provided.
 *
 * @type {boolean}
 */
const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// clients to use
/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {BffClientDelegationsApiClient | undefined} */
let clientDelegationsApiClient = undefined;
/** @type {BffConnectionsApiClient | undefined} */
let connectionsApiClient = undefined;
/** @type {BffAccessPackageApiClient | undefined} */
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([getConnectionsLabel, getAgentsLabel, getClientsLabel, getDelegationCheckLabel, tokenGeneratorLabel]);

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`,
        { tags: { action: "fetch-test-data" } }
    );
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 *   BffConnectionsApiClient,
 *   BffClientDelegationsApiClient,
 *   BffAccessPackageApiClient,
 *   PersonalTokenGenerator
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
    if (clientDelegationsApiClient == undefined) {
        clientDelegationsApiClient = new BffClientDelegationsApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, clientDelegationsApiClient, accessPackageApiClient, tokenGenerator];
}

/**
 * Main function executed by each VU.
 *
 * @param testData
 */
export default function (testData) {
    // connectionsApiClient for bff
    const [connectionsApiClient, clientDelegationsApiClient, bffAccessPackageApiClient, tokenGenerator] = getClients();
    const testObject = getItemFromList(testData[exec.vu.idInTest - 1], randomize);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(testObject.userId, testObject.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabelValue, function () {
        const connectionsQueryParams = {
            party: testObject.partyUuid,
            from: testObject.orgUuid,
            to: testObject.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true
        };
        GetConnections(connectionsApiClient, connectionsQueryParams, getConnectionsLabel);
        const queryParams = {
            party: testObject.orgUuid,
        };
        GetAgents(clientDelegationsApiClient, queryParams, getAgentsLabel);
        GetClients(clientDelegationsApiClient, queryParams, getClientsLabel);
        GetDelegationCheck(bffAccessPackageApiClient, queryParams, getDelegationCheckLabel);
    });
}
