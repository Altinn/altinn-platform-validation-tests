import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";
import { requireEnv } from "../../../../../helpers.js";
import { GetConnections, PostRightholder, DeleteRightholder } from "../../../../building-blocks/authentication/connections/index.js";
import { PostDelegations, DeleteDelegations } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../../common-imports.js";
import { BffConnectionsApiClient, BffAccessPackageApiClient } from "../../../../../clients/authentication/index.js";
import { getItemFromList, parseCsvData, segmentData, getNumberOfVUs, getOptions } from "../../../../../helpers.js";
import { accessPackagesForUsers as accessPackages, getTokenOpts, getFromTo } from "./commons.js";

// Labels for different actions
const postRightholderLabel = { step: "1. Connecting users with PostRightholder" };
const getRightholdersToLabel = { step: "2. Get rightholders" };
const getRightholdersWithoutToLabel = { step: "3. Get rightholders" };
const tokenGeneratorLabel = { tokenGenerator: "Personal Token Generator" };
const accessPackageLabel = { step: "4. Access Package Delegation" };
const accessPackageDeleteLabel = { step: "5. Access Package Delete Delegation" };
const deleteRightholderConnectionLabel = { step: "6. Delete rightholder connection" };
const groupLabel = "0. Delegate accesspackage from user to user";

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
/** @type {BffConnectionsApiClient | undefined} */
let connectionsApiClient = undefined;
/** @type {BffAccessPackageApiClient | undefined} */
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
 *   BffConnectionsApiClient,
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
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, accessPackageApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/delegation/${__ENV.ENVIRONMENT}/fullmakt-user-user.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
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
        PostRightholder(connectionsApiClient, from.partyUuid, to.ssn, to.lastName, postRightholderLabel);
        getRightHolders(connectionsApiClient, from);
        getRightHoldersWithoutTo(connectionsApiClient, from);
        PostDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageLabel);
        DeleteDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageDeleteLabel);
        DeleteRightholder(connectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, deleteRightholderConnectionLabel);
    });
}

function getRightHolders(connectionsApiClient, party) {
    const queryParamsTo = {
        party: party.partyUuid,
        from: party.partyUuid,
        to: party.partyUuid,
        includeClientDelegations: true,
        includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersToLabel
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party) {
    const queryParamsTo = {
        party: party.partyUuid,
        from: party.partyUuid,
        includeClientDelegations: true,
        includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersWithoutToLabel
    );
    return respBody;
}
