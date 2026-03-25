/**
 * Performance test for client administration in the authentication service.
 * This test simulates the actions browser actions for opening the client administrator, 
 * including retrieving connections/rightholders, agents, clients, and delegation checks.
 * The test data is segmented for each VU to ensure that each virtual user operates on a unique set of data.
 * The test includes options for randomizing data selection and is designed to run in different environments based on the provided environment variables.
 * The test uses a personal token generator to authenticate requests and interacts with the BFF API clients for connections, client delegations, and access packages.
 */

import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { getItemFromList, getOptions, parseCsvData, segmentData, getNumberOfVUs } from "../../../../../helpers.js";
import { BffConnectionsApiClient, BffClientDelegationsApiClient, BffAccessPackageApiClient } from "../../../../../clients/authentication/index.js";
import { GetAgents, GetClients } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetDelegationCheck } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { GetConnections } from "../../../../building-blocks/authentication/connections/index.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getTokenOpts } from "./commons.js";

// Labels for different actions
const tokenGeneratorLabel = "Personal Token Generator";
const groupLabel = "Open client administration";

const getConnectionsLabel = "1. Get connections/rightholders";
const getAgentsLabel = "2. Get agents";
const getClientsLabel = "3. Get clients";
const getDelegationCheckLabel = "4. Get delegation check";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// clients to use
let tokenGenerator = undefined;
let clientDelegationsApiClient = undefined;
let connectionsApiClient = undefined;
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([getConnectionsLabel, getAgentsLabel, getClientsLabel, getDelegationCheckLabel, tokenGeneratorLabel]);

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
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
 */
export default function (testData) {
    // connectionsApiClient for bff
    const [connectionsApiClient, clientDelegationsApiClient, bffAccessPackageApiClient, tokenGenerator] = getClients();
    const testObject = getItemFromList(testData[exec.vu.idInTest - 1], randomize);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(testObject.userId, testObject.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabel, function () {
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

