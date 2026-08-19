import { group } from "k6";
import exec from "k6/execution";

import {
    AccessPackageClient,
    CreateAccessPackageDelegationQueryBuilder,
    DeleteAccessPackageDelegationQueryBuilder,
} from "../../../../clients/access-management-bff/access-package/index.js";
import {
    ConnectionClient,
    DeleteReporteeConnectionQueryBuilder,
    GetRightHoldersQueryBuilder,
    ValidatePersonInputBuilder,
} from "../../../../clients/access-management-bff/connection/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString, } from "../../../../scopes.js";
import { CreateAccessPackageDelegation, DeleteAccessPackageDelegation } from "../../../building-blocks/access-management-bff/access-package/index.js";
import { CreateRightHolder, DeleteReporteeConnection, GetRightHolders } from "../../../building-blocks/access-management-bff/connection/index.js";
import { getFromTo, getTokenOpts } from "../commons.js";
import { accessPackagesForUsers as accessPackages } from "../custom-data.js";

// Labels for different actions
const postRightholderLabel = { step: "1. Connecting users with PostRightholder" };
const getRightholdersToLabel = { step: "2. Get rightholders" };
const getRightholdersWithoutToLabel = { step: "3. Get rightholders" };

const accessPackageLabel = { step: "4. Access Package Delegation" };
const accessPackageDeleteLabel = { step: "5. Access Package Delete Delegation" };
const deleteRightholderConnectionLabel = { step: "6. Delete rightholder connection" };
const groupLabel = "0. Delegate accesspackage from user to user";

const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

/**
 * Whether test data should be randomized.
 *
 * Defaults to `true` when the `RANDOMIZE` environment variable is not provided.
 *
 * @type {boolean}
 */
const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {ConnectionClient | undefined} */
let connectionsApiClient = undefined;
/** @type {AccessPackageClient | undefined} */
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([
    postRightholderLabel,
    getRightholdersToLabel,
    getRightholdersWithoutToLabel,
    accessPackageLabel,
    accessPackageDeleteLabel,
    deleteRightholderConnectionLabel,
    tokenGeneratorLabel
]);

/**
 * Creates and caches API clients used by the scenario.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * ConnectionClient,
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
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new AccessPackageClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, accessPackageApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Users to delegate between, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management-bff/access-packages/user-to-user/${__ENV.ENVIRONMENT}.csv`, true, "re-usable-fetch-data-function-and-cleanup-test-data-folder");
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} segmentedData Users to delegate between, one slice per VU.
 */
export default function (segmentedData) {
    const [connectionsApiClient, accessPackageApiClient, tokenGenerator] = getClients();

    // // Get from and to users for the test iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);

    // // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabel, function () {
        CreateRightHolder(
            connectionsApiClient,
            from.partyUuid,
            new ValidatePersonInputBuilder()
                .withPersonIdentifier(to.ssn)
                .withLastName(to.lastName)
                .build(),
            null,
            postRightholderLabel,
        );
        getRightHolders(connectionsApiClient, from);
        getRightHoldersWithoutTo(connectionsApiClient, from);
        CreateAccessPackageDelegation(
            accessPackageApiClient,
            new CreateAccessPackageDelegationQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withPackageId(accessPackage.id)
                .build(),
            accessPackageLabel,
        );
        DeleteAccessPackageDelegation(
            accessPackageApiClient,
            new DeleteAccessPackageDelegationQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withPackageId(accessPackage.id)
                .build(),
            accessPackageDeleteLabel,
        );
        DeleteReporteeConnection(
            connectionsApiClient,
            new DeleteReporteeConnectionQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            deleteRightholderConnectionLabel,
        );
    });
}

function getRightHolders(connectionsApiClient, party) {
    const respBody = GetRightHolders(
        connectionsApiClient,
        new GetRightHoldersQueryBuilder()
            .withParty(party.partyUuid)
            .withFrom(party.partyUuid)
            .withTo(party.partyUuid)
            .withIncludeClientDelegations(true)
            .withIncludeAgentConnections(true)
            .build(),
        getRightholdersToLabel
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party) {
    const respBody = GetRightHolders(
        connectionsApiClient,
        new GetRightHoldersQueryBuilder()
            .withParty(party.partyUuid)
            .withFrom(party.partyUuid)
            .withIncludeClientDelegations(true)
            .withIncludeAgentConnections(true)
            .build(),
        getRightholdersWithoutToLabel
    );
    return respBody;
}
