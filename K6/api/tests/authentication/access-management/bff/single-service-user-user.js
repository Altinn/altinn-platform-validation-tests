import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections, PostRightholder, DeleteRightholder } from "../../../../building-blocks/authentication/connections/index.js";
import {
    GetIsHovedAdmin,
    GetRolePermissions,
    GetDelegatedResources,
    SearchAccessPackages,
    SearchResources,
    GetResourceOwners,
    GetDelegationCheck,
    PostSingleRight,
    GetDelegatedRightsForResource,
    RevokeSingleRight,
    GetRoleMeta,
    GetRightsMeta,
} from "../../../../building-blocks/authentication/client-delegations/index.js";
import { parseCsvData, segmentData, getNumberOfVUs, getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetDelegations } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, BffAccessPackageApiClient, BffAccessManagementApiClient, BffSingleRightApiClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getTokenOpts, resourcesForUsers as resources, getFromTo } from "./commons.js";

// Labels for different actions
const getRightholdersLabel1a = { step: "1a. Get rightholders from user" };
const postRightholderLabel = { step: "1b. Connecting users with PostRightholder" };
const getRightholdersLabel1c = { step: "1c. Get rightholders from user to all" };
const getRightholdersLabel1d = { step: "1d. Get rightholders from user to other user" };
const getIsHovedAdminLabel = { step: "1f. Get is hovedadmin for user" };
const getRolePermissionsLabel = { step: "1g. Get role permissions from user to user" };
const getDelegationsLabel = { step: "1h. Get delegations from user to user" };
const getDelegatedResourcesLabel = { step: "1i. Get delegated resources from user to user" };
const searchAccessPackagesLabel = { step: "1j. Search access packages for user" };
const searchResourcesLabel = { step: "1k. Search resources for person" };
const getResourceOwnersLabel = { step: "1l. Get resource owners for user" };

const searchAccessPackagesLabel2a = { step: "2a. Search resources for person" };
const getRightsMetadataLabel2b = { step: "2b. Get rights metadata for resource" };
const getDelegationCheckLabel = { step: "2c. Get delegation check for client delegation" };
const postDelegationLabel = { step: "2d. Delegate serviceresource from user to user" };
const getDelegatedResourcesLabel2e = { step: "2e. Get delegated resources for user" };
const getDelegationCheckLabel2f = { step: "2f. Get delegation check for user after delegating" };
const getDelegatedRightsForResourceLabel2g = { step: "2g. Get delegated rights for resource for user" };

const revokeSingleRightLabel = { step: "3a. Revoke single right for user" };
const getDelegatedResourcesLabel3b = { step: "3b. Get delegated resources for user after revoking single right" };
const getRolePermissionsLabel3d = { step: "3d. Get role permissions for user to user after revoking single right" };
const getRoleMetaLabel3f = { step: "3f. Get role meta before revoking single right" };
const getDelegationsLabel3g = { step: "3g. Get delegations from user to user" };
const deleteRightholderConnectionLabel = { step: "3h. Delete rightholder connection between users" };
const getRolePermissionsLabel3j = { step: "3j. Get role permissions for user to user after delete" };
const getRoleMetaLabel3k = { step: "3k. Get role meta after revoking single right" };
const getDelegationsLabel3l = { step: "3l. Get delegations from user to user after delete" };
const getRightholdersLabel3m = { step: "3m. Get rightholders from user after delete" };

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
        getDelegatedResourcesLabel2e,
        getDelegationCheckLabel2f,
        getDelegatedRightsForResourceLabel2g,

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
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (segmentedData) {
    const [connectionsApiClient, accessPackageApiClient, singleRightsApiClient, userApiClient, tokenGenerator] = getClients();

    // Get from and to users and resource for the current iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Part 1.
    // Add user to auser,
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
    // Delegate a single resource to the added user and verify delegation
    group(resourceDelegationGroup, function () {
        SearchAccessPackages(userApiClient, { searchString: resource.searchTerm, typeName: "person" }, searchAccessPackagesLabel2a);
        const rightsMeta = GetRightsMeta(userApiClient, { resource: resource.resourceId }, getRightsMetadataLabel2b);
        GetDelegationCheck(singleRightsApiClient, { from: from.partyUuid, resource: resource.resourceId }, getDelegationCheckLabel);
        PostSingleRight(singleRightsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid, resourceId: resource.resourceId }, getRights(rightsMeta), postDelegationLabel);
        GetDelegatedResources(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegatedResourcesLabel2e);
        GetDelegationCheck(singleRightsApiClient, { from: from.partyUuid, resource: resource.resourceId }, getDelegationCheckLabel2f);
        GetDelegatedRightsForResource(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, resourceId: resource.resourceId }, getDelegatedRightsForResourceLabel2g);
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed,
    // then clean up by deleting the rightholder connection between the users and verify deletion
    group(cleanupGroup, function () {
        RevokeSingleRight(singleRightsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid, resourceId: resource.resourceId }, revokeSingleRightLabel);
        GetDelegatedResources(userApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegatedResourcesLabel3b);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, getRolePermissionsLabel3d);
        GetRoleMeta(userApiClient, {}, getRoleMetaLabel3f);
        GetDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid }, getDelegationsLabel3g);
        DeleteRightholder(connectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: to.partyUuid }, deleteRightholderConnectionLabel);
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
