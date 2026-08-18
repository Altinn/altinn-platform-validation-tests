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

import {
    AccessPackageClient,
    GetAccessPackageDelegationCheckQueryBuilder,
} from "../../../../clients/access-management-bff/access-package/index.js";
import {
    ClientDelegationsClient,
    GetAgentsQueryBuilder,
    GetClientsQueryBuilder,
} from "../../../../clients/access-management-bff/client-delegations/index.js";
import {
    ConnectionClient,
    GetRightHoldersQueryBuilder,
} from "../../../../clients/access-management-bff/connection/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { GetAccessPackageDelegationCheck } from "../../../building-blocks/access-management-bff/access-package/index.js";
import { GetAgents, GetClients } from "../../../building-blocks/access-management-bff/client-delegations/index.js";
import { GetRightHolders } from "../../../building-blocks/access-management-bff/connection/index.js";
import { getTokenOpts } from "../commons.js";

// Labels for different actions
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };
const groupLabelValue = "Open client administration";

const getConnectionsLabel = { step: `1. ${ConnectionClient.TAGS.GetRightHolders.action}` };
const getAgentsLabel = { step: `2. ${ClientDelegationsClient.TAGS.GetAgents.action}` };
const getClientsLabel = { step: `3. ${ClientDelegationsClient.TAGS.GetClients.action}` };
const getDelegationCheckLabel = { step: `4. ${AccessPackageClient.TAGS.GetAccessPackageDelegationCheck.action}` };

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
/** @type {ClientDelegationsClient | undefined} */
let clientDelegationsApiClient = undefined;
/** @type {ConnectionClient | undefined} */
let connectionsApiClient = undefined;
/** @type {AccessPackageClient | undefined} */
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([getConnectionsLabel, getAgentsLabel, getClientsLabel, getDelegationCheckLabel, tokenGeneratorLabel]);

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations with a party uuid, one slice per VU.
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
 * ConnectionClient,
 * ClientDelegationsClient,
 * AccessPackageClient,
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
    if (clientDelegationsApiClient == undefined) {
        clientDelegationsApiClient = new ClientDelegationsClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new AccessPackageClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, clientDelegationsApiClient, accessPackageApiClient, tokenGenerator];
}

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} testData Organizations with a party uuid, one slice per VU.
 */
export default function (testData) {
    // connectionsApiClient for bff
    const [connectionsApiClient, clientDelegationsApiClient, bffAccessPackageApiClient, tokenGenerator] = getClients();
    const testObject = getItemFromList(testData[exec.vu.idInTest - 1], randomize);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(testObject.userId, testObject.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabelValue, function () {
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(testObject.partyUuid)
                .withFrom(testObject.orgUuid)
                .withTo(testObject.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getConnectionsLabel,
        );
        GetAgents(
            clientDelegationsApiClient,
            new GetAgentsQueryBuilder()
                .withParty(testObject.orgUuid)
                .build(),
            getAgentsLabel,
        );
        GetClients(
            clientDelegationsApiClient,
            new GetClientsQueryBuilder()
                .withParty(testObject.orgUuid)
                .build(),
            getClientsLabel,
        );
        GetAccessPackageDelegationCheck(
            bffAccessPackageApiClient,
            new GetAccessPackageDelegationCheckQueryBuilder()
                .withParty(testObject.orgUuid)
                .build(),
            getDelegationCheckLabel,
        );
    });
}
