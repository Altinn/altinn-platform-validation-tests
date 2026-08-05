import { group } from "k6";
import exec from "k6/execution";
import http from "k6/http";

import {
    AccessPackageClient,
    CreateAccessPackageDelegationQueryBuilder,
    DeleteAccessPackageDelegationQueryBuilder,
    GetAccessPackagePermissionQueryBuilder,
} from "../../../clients/access-management-bff/access-package/index.js";
import {
    ClientDelegationsClient,
    CreateAgentAccessPackagesQueryBuilder,
    CreateAgentQueryBuilder,
    DelegationBatchInputDtoBuilder,
    DeleteAgentAccessPackagesQueryBuilder,
    DeleteAgentQueryBuilder,
    GetAgentAccessPackagesQueryBuilder,
    GetAgentsQueryBuilder,
    GetClientAccessPackagesQueryBuilder,
    GetClientsQueryBuilder,
} from "../../../clients/access-management-bff/client-delegations/index.js";
import {
    ConnectionClient,
    DeleteReporteeConnectionQueryBuilder,
    GetRightHoldersQueryBuilder,
} from "../../../clients/access-management-bff/connection/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, pickUnique, requireEnv, segmentData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { CreateAccessPackageDelegation, DeleteAccessPackageDelegation, GetAccessPackagePermission } from "../../building-blocks/access-management-bff/access-package/index.js";
import {
    CreateAgent,
    CreateAgentAccessPackages,
    DeleteAgent,
    DeleteAgentAccessPackages,
    GetAgentAccessPackages,
    GetAgents,
    GetClientAccessPackages,
    GetClients,
} from "../../building-blocks/access-management-bff/client-delegations/index.js";
import { CreateRightHolder, DeleteReporteeConnection, GetRightHolders } from "../../building-blocks/access-management-bff/connection/index.js";
import { getTokenOpts } from "./commons.js";
import { accessPackagesForOrgs as accessPackages } from "./custom-data.js";

// Labels for different actions
const getPermissionsLabel = { step: "1a. Get permissions" };
const getRightholdersWithoutToLabel1b = { step: "1b. Get rightholders without to parameter" };
const postRightholderLabel = { step: "1d. Connecting organizations with PostRightholder" };
const getRightholdersToLabel1e = { step: "1e. Get rightholders with to parameter" };
const getRightholdersWithoutToLabel1f = { step: "1f. Get rightholders without to parameter" };
const postDelegationLabel = { step: "1g. Delegate access package from org to org" };

const postAgentsLabel = { step: "2a. Add agent to organization" };
const getAgentsLabel = { step: "2b. Get agents for organization" };
const getAccessPackagesLabel = { step: "2c. Get access packages for agent delegation" };
const getClientsLabel = { step: "2d. Get clients for organization" };
const getRightholdersToLabel2e = { step: "2e. Get rightholders with to parameter after adding agent delegation" };

const getRightholdersToLabel3a = { step: "3a. Get rightholders with to parameter for client delegation" };
const postAccessPackageLabel = { step: "3b. Delegate access package to user for client delegation" };
const getAccessPackagesLabel3c = { step: "3c. Get access packages for client delegation" };

const deleteClientDelegationLabel = { step: "4a. Delete access package delegation from org to org" };
const deleteAgentsLabel = { step: "4b. Delete agent delegation" };
const deleteAccessPackageLabel = { step: "4c. Delete access package for client delegation" };
const deleteRightholderConnectionLabel = { step: "4d. Delete rightholder connection between orgs" };

const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

const fullmaktGroup = "1. Delegate accesspackage from organization to organization";
const addUserGroup = "2. Add user as rightholder to organization";
const clientDelegationGroup = "3. Client delegation from organization to user";
const cleanupGroup = "4. Cleanup - delete delegation";

/**
 * Whether test data should be randomized.
 *
 * Defaults to `true` when the `RANDOMIZE` environment variable is not provided.
 *
 * @type {boolean}
 */
const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// get k6 options
export const options = getOptions(
    [
        getPermissionsLabel,
        getRightholdersWithoutToLabel1b,
        postRightholderLabel,
        getRightholdersToLabel1e,
        getRightholdersWithoutToLabel1f,
        postDelegationLabel,
        postAgentsLabel,
        getAgentsLabel,
        getAccessPackagesLabel,
        getClientsLabel,
        getRightholdersToLabel2e,
        tokenGeneratorLabel,
        getRightholdersToLabel3a,
        postAccessPackageLabel,
        getAccessPackagesLabel3c,
        deleteClientDelegationLabel,
        deleteAgentsLabel,
        deleteAccessPackageLabel,
        deleteRightholderConnectionLabel
    ],
);

/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {ConnectionClient | undefined} */
let connectionsApiClient = undefined;
/** @type {AccessPackageClient | undefined} */
let accessPackageApiClient = undefined;
/** @type {ClientDelegationsClient | undefined} */
let clientDelegationsApiClient = undefined;

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * ConnectionClient,
 * AccessPackageClient,
 * ClientDelegationsClient,
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
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new AccessPackageClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (clientDelegationsApiClient == undefined) {
        clientDelegationsApiClient = new ClientDelegationsClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, accessPackageApiClient, clientDelegationsApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations and a user to act as agent, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/delegation/${__ENV.ENVIRONMENT}/fullmakt-org-org.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} segmentedData Organizations and a user to act as agent, one slice per VU.
 */
export default function (segmentedData) {
    // testdata. [0] contains segmented user data for each VU, [1] contains access packages
    const [connectionsApiClient, accessPackageApiClient, clientDelegationsApiClient, tokenGenerator] = getClients();

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    const { from, to, user } = getFromToUser(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(fullmaktGroup, function () {
        GetAccessPackagePermission(
            accessPackageApiClient,
            accessPackage.id,
            new GetAccessPackagePermissionQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .build(),
            getPermissionsLabel,
        );
        getRightHoldersWithoutTo(connectionsApiClient, from, getRightholdersWithoutToLabel1b);
        // TODO: add this to test: `https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/lookup/org/${from.orgNo}`
        CreateRightHolder(connectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        getRightHolders(connectionsApiClient, from, to, getRightholdersToLabel1e);
        getRightHoldersWithoutTo(connectionsApiClient, from, getRightholdersWithoutToLabel1f);
        CreateAccessPackageDelegation(
            accessPackageApiClient,
            new CreateAccessPackageDelegationQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withPackageId(accessPackage.id)
                .build(),
            postDelegationLabel,
        );
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(to.userId, to.partyUuid));

    group(addUserGroup, function () {
        CreateAgent(
            clientDelegationsApiClient,
            new CreateAgentQueryBuilder()
                .withParty(to.orgUuid)
                .withTo(user.partyUuid)
                .build(),
            postAgentsLabel,
        );
        GetAgents(
            clientDelegationsApiClient,
            new GetAgentsQueryBuilder()
                .withParty(to.orgUuid)
                .build(),
            getAgentsLabel,
        );
        GetAgentAccessPackages(
            clientDelegationsApiClient,
            new GetAgentAccessPackagesQueryBuilder()
                .withParty(to.orgUuid)
                .withTo(user.partyUuid)
                .build(),
            getAccessPackagesLabel,
        );
        GetClients(
            clientDelegationsApiClient,
            new GetClientsQueryBuilder()
                .withParty(to.orgUuid)
                .build(),
            getClientsLabel,
        );
        getRightHolders(connectionsApiClient, to, user, getRightholdersToLabel2e);
    });

    group(clientDelegationGroup, function () {
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(to.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersToLabel3a,
        );
        CreateAgentAccessPackages(
            clientDelegationsApiClient,
            new CreateAgentAccessPackagesQueryBuilder()
                .withParty(to.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(user.partyUuid)
                .build(),
            buildAccessPackageBatch(accessPackage.accessPackage),
            postAccessPackageLabel,
        );
        GetClientAccessPackages(
            clientDelegationsApiClient,
            new GetClientAccessPackagesQueryBuilder()
                .withParty(to.orgUuid)
                .withFrom(from.orgUuid)
                .build(),
            getAccessPackagesLabel3c,
        );
    });

    group(cleanupGroup, function () {
        DeleteAgentAccessPackages(
            clientDelegationsApiClient,
            new DeleteAgentAccessPackagesQueryBuilder()
                .withParty(to.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(user.partyUuid)
                .build(),
            buildAccessPackageBatch(accessPackage.accessPackage),
            deleteClientDelegationLabel,
        );
        DeleteAgent(
            clientDelegationsApiClient,
            new DeleteAgentQueryBuilder()
                .withParty(to.orgUuid)
                .withTo(user.partyUuid)
                .build(),
            deleteAgentsLabel,
        );
        tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
        DeleteAccessPackageDelegation(
            accessPackageApiClient,
            new DeleteAccessPackageDelegationQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withPackageId(accessPackage.id)
                .build(),
            deleteAccessPackageLabel,
        );
        DeleteReporteeConnection(
            connectionsApiClient,
            new DeleteReporteeConnectionQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            deleteRightholderConnectionLabel,
        );
    });

}

/**
 * Builds the delegation body for an access package, delegated for the
 * rettighetshaver role.
 *
 * @param {string} accessPackage Access package name, without the urn prefix.
 * @returns {DelegationBatchInputDto} The delegation body.
 */
function buildAccessPackageBatch(accessPackage) {
    return new DelegationBatchInputDtoBuilder()
        .addPermission("rettighetshaver", [`urn:altinn:accesspackage:${accessPackage}`])
        .build();
}

function getRightHolders(connectionsApiClient, from, to, labels) {
    const respBody = GetRightHolders(
        connectionsApiClient,
        new GetRightHoldersQueryBuilder()
            .withParty(from.orgUuid)
            .withFrom(from.orgUuid)
            .withTo(to.partyUuid)
            .withIncludeClientDelegations(true)
            .withIncludeAgentConnections(true)
            .build(),
        labels
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party, labels) {
    const respBody = GetRightHolders(
        connectionsApiClient,
        new GetRightHoldersQueryBuilder()
            .withParty(party.orgUuid)
            .withFrom(party.orgUuid)
            .withIncludeClientDelegations(true)
            .withIncludeAgentConnections(true)
            .build(),
        labels,
    );
    return respBody;
}

function getFromToUser(list) {
    const [from, to, user] = pickUnique(list, 3);
    return { from, to, user };
}
