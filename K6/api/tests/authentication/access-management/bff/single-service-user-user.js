import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections, PostRightholder } from "../../../../building-blocks/authentication/connections/index.js";
import {
    GetIsHovedAdmin,
    GetRolePermissions,
    GetDelegatedResources,
    SearchAccessPackages,
    SearchResources,
    GetResourceOwners,
    GetOrganizationData,
    GetDelegationCheck,
    PostSingleRight,
    GetDelegatedRightsForResource,
    RevokeSingleRight,
    DeleteRightholderConnection,
    GetRoleMeta,
    GetRightsMeta,
} from "../../../../building-blocks/authentication/client-delegations/index.js";
import { parseCsvData, segmentData, getNumberOfVUs, getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetDelegations } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, BffAccessPackageApiClient, BffAccessManagementApiClient, BffSingleRightApiClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getTokenOpts, resourcesForUsers as resources } from "./commons.js";

// Labels for different actions
const getRightholdersLabel1a = "1a. Get rightholders from user";
const postRightholderLabel = "1b. Connecting users with PostRightholder";
const getRightholdersLabel1c = "1c. Get rightholders from user to all";
const getRightholdersLabel1d = "1d. Get rightholders from user to other user";
const getIsHovedAdminLabel = "1f. Get is hovedadmin for user";
const getRolePermissionsLabel = "1g. Get role permissions from user to user";
const getDelegationsLabel = "1h. Get delegations from user to user";
const getDelegatedResourcesLabel = "1i. Get delegated resources from user to user";
const searchAccessPackagesLabel = "1j. Search access packages for user";
const searchResourcesLabel = "1k. Search resources for person";
const getResourceOwnersLabel = "1l. Get resource owners for user";

const searchAccessPackagesLabel2a = "2a. Search resources for person";
const getRightsMetadataLabel2b = "2b. Get rights metadata for resource";
const getDelegationCheckLabel = "2c. Get delegation check for client delegation";
const postDelegationLabel = "2d. Delegate serviceresource from user to user";
const getDelegatedResourcesLabel2d = "2e. Get delegated resources for user";
const getDelegationCheckLabel2e = "2f. Get delegation check for user after delegating";
const getDelegatedRightsForResourceLabel2f = "2g. Get delegated rights for resource for user";

const revokeSingleRightLabel = "3a. Revoke single right for user";
const getDelegatedResourcesLabel3b = "3b. Get delegated resources for user after revoking single right";
const getRolePermissionsLabel3d = "3d. Get role permissions for user to user after revoking single right";
const getRoleMetaLabel3f = "3f. Get role meta before revoking single right";
const getDelegationsLabel3g = "3g. Get delegations from user to user";
const deleteRightholderConnectionLabel = "3h. Delete rightholder connection between users";
const getRolePermissionsLabel3j = "3j. Get role permissions for user to user after delete";
const getRoleMetaLabel3k = "3k. Get role meta after revoking single right";
const getDelegationsLabel3l = "3l. Get delegations from user to user after delete";
const getRightholdersLabel3m = "3m. Get rightholders from user after delete";

const addUserGroup = "1. ********* Connect ********";
const resourceDelegationGroup = "2. ******** Delegate  ********";
const cleanupGroup = "3. ********* Cleanup  *********";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// get k6 options
export const options = getOptions(
    [
        addUserGroup,
        getRightholdersLabel1a,
        postRightholderLabel,
        getRightholdersLabel1c,
        getRightholdersLabel1d,
        getIsHovedAdminLabel,
        getRolePermissionsLabel,
        getDelegationsLabel,
        getDelegatedResourcesLabel,
        searchAccessPackagesLabel,
        searchResourcesLabel,
        getResourceOwnersLabel,

        resourceDelegationGroup,
        searchAccessPackagesLabel2a,
        getRightsMetadataLabel2b,
        getDelegationCheckLabel,
        postDelegationLabel,
        getDelegatedResourcesLabel2d,
        getDelegationCheckLabel2e,
        getDelegatedRightsForResourceLabel2f,

        cleanupGroup,
        revokeSingleRightLabel,
        getDelegatedResourcesLabel3b,
        getRolePermissionsLabel3d,
        getRoleMetaLabel3f,
        getDelegationsLabel3g,
        deleteRightholderConnectionLabel,
        getRolePermissionsLabel3j,
        getRoleMetaLabel3k,
        getDelegationsLabel3l,
        getRightholdersLabel3m,

    ],
);

let tokenGenerator = undefined;
let connectionsApiClient = undefined;
let accessPackageApiClient = undefined;
let singleRightsApiClient = undefined;
let userApiClient = undefined;

// get k6 options

function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
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
    if (singleRightsApiClient == undefined) {
        singleRightsApiClient = new BffSingleRightApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (userApiClient == undefined) {
        userApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, accessPackageApiClient, singleRightsApiClient, userApiClient, tokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (segmentedData) {
    const [connectionsApiClient, accessPackageApiClient, singleRightsApiClient, userApiClient, tokenGenerator] = getClients();

    // Get from and to organizations and resource for the current iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);

    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.partyUuid} -> ${to.ssn}/${to.partyUuid})`);
    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));


    // Part 1. 
    // Add organization as user to another organization,
    group(addUserGroup, function () {
        PostRightholder(connectionsApiClient, from.partyUuid, to.ssn, to.lastName, postRightholderLabel);
        let queryParams = {
            party: from.partyUuid,
            from: from.partyUuid,
            to: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1a);
        queryParams = {
            party: from.partyUuid,
            from: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1c);
        queryParams = {
            party: from.partyUuid,
            from: from.partyUuid,
            to: to.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1d);
        GetIsHovedAdmin(userApiClient, { party: from.partyUuid }, getIsHovedAdminLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getRolePermissionsLabel);
        GetDelegations(accessPackageApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getDelegationsLabel);
        GetDelegatedResources(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getDelegatedResourcesLabel);
        SearchAccessPackages(userApiClient, { searchString: "", typeName: "person" }, searchAccessPackagesLabel);
        SearchResources(userApiClient, { Page: 1, ResultsPerPage: 7, searchString: "", includeA2Services: false }, searchResourcesLabel);
        GetResourceOwners(userApiClient, { undefined }, getResourceOwnersLabel);
    });

    // Part 2.
    // Delegate a single resource to the added organization and verify delegation
    group(resourceDelegationGroup, function () {
        SearchAccessPackages(userApiClient, { searchString: resource.searchTerm, typeName: "person" }, searchAccessPackagesLabel2a);
        const rightsMeta = GetRightsMeta(userApiClient, { resource: resource.resourceId }, getRightsMetadataLabel2b);
        GetDelegationCheck(singleRightsApiClient, { from: from.partyUuid, resource: resource.resourceId }, getDelegationCheckLabel);
        PostSingleRight(singleRightsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid, resourceId: resource.resourceId }, getRights(rightsMeta), postDelegationLabel);
        GetDelegatedResources(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegatedResourcesLabel2d);
        GetDelegationCheck(singleRightsApiClient, { from: from.partyUuid, resource: resource.resourceId }, getDelegationCheckLabel2e);
        GetDelegatedRightsForResource(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, resourceId: resource.resourceId }, getDelegatedRightsForResourceLabel2f);
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed, 
    // then clean up by deleting the rightholder connection between the organizations and verify deletion
    group(cleanupGroup, function () {
        RevokeSingleRight(singleRightsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid, resourceId: resource.resourceId }, revokeSingleRightLabel);
        GetDelegatedResources(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegatedResourcesLabel3b);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getRolePermissionsLabel3d);
        GetRoleMeta(userApiClient, {}, getRoleMetaLabel3f);
        GetDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegationsLabel3g);
        DeleteRightholderConnection(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, deleteRightholderConnectionLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getRolePermissionsLabel3j);
        GetRoleMeta(userApiClient, {}, getRoleMetaLabel3k);
        GetDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegationsLabel3l);
        let queryParams = {
            party: from.partyUuid,
            from: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel3m);
    });
}

/**
 * Helper function to extract rights from rights metadata response
 * @returns list of rights
 */
function getRights(rightsMeta) {
    const jsonResp = JSON.parse(rightsMeta);
    const rights = [];
    for (const right of jsonResp) {
        rights.push(right.key);
    }
    return rights;
}

/**
 * Helper function to get from and to organizations for the current iteration, ensuring that they are not the same
 * @returns object with from and to organizations
 */
function getFromTo(list) {
    let from = undefined;
    if (randomize) {
        from = getItemFromList(list, randomize);
    } else {
        from = list[__ITER % list.length];
    }
    let to = getItemFromList(list, true);
    while (to.ssn === from.ssn) {
        to = getItemFromList(list, true);
    }
    return { from, to };

}

