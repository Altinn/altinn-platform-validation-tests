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
    GetOrganizationData,
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
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "https://github.com/Altinn/altinn-platform/releases/download/altinn-k6-lib-0.0.9/index.js";
import { getTokenOpts, resourcesForOrg as resources } from "./commons.js";

// Labels for different actions
const getRightholdersLabel1a = "1a. Get rightholders from org";
const postRightholderLabel = "1b. Connecting organizations with PostRightholder";
const getRightholdersLabel1c = "1c. Get rightholders org -> dagl";
const getRightholdersLabel1d = "1d. Get rightholders from org";
const getRightholdersLabel1e = "1e. Get rightholders from org to org";
const getIsHovedAdminLabel = "1f. Get is hovedadmin for org";
const getRolePermissionsLabel = "1g. Get role permissions for org to org";
const getDelegationsLabel = "1h. Get delegations from org to org";
const getDelegatedResourcesLabel = "1i. Get delegated resources from org to org";
const searchAccessPackagesLabel = "1j. Search access packages for org";
const searchResourcesLabel = "1k. Search resources for org";
const getResourceOwnersLabel = "1l. Get resource owners for org";
const getOrganizationDataLabel = "1m. Get organization data for org";

const searchAccessPackagesLabel2a = "2a. Search access packages for org";
const getRightsMetadataLabel2b = "2b. Get rights metadata for resource";
const getDelegationCheckLabel = "2c. Get delegation check for client delegation";
const postDelegationLabel = "2d. Delegate serviceresource from org to org";
const getDelegatedResourcesLabel2d = "2e. Get delegated resources for client delegation";
const getDelegationCheckLabel2e = "2f. Get delegation check for client delegation after delegating";
const getDelegatedRightsForResourceLabel2f = "2g. Get delegated rights for resource for client delegation";

const revokeSingleRightLabel = "3a. Revoke single right for client delegation";
const getDelegatedResourcesLabel3b = "3b. Get delegated resources for client delegation after revoking single right";
const getDelegationCheckLabel3c = "3c. Get delegation check for client delegation after revoking single right";
const getRolePermissionsLabel3d = "3d. Get role permissions for user to org";
const getRolePermissionsLabel3e = "3e. Get role permissions for org to org";
const getRoleMetaLabel3f = "3f. Get role meta before revoking single right";
const getDelegationsLabel3g = "3g. Get delegations from org to org";
const deleteRightholderConnectionLabel = "3h. Delete rightholder connection between orgs";
const getRolePermissionsLabel3i = "3i. Get role permissions for user to org after delete";
const getRolePermissionsLabel3j = "3j. Get role permissions for org to org after delete";
const getRoleMetaLabel3k = "3k. Get role meta after revoking single right";
const getDelegationsLabel3l = "3l. Get delegations from org to org after delete";
const getRightholdersLabel3m = "3m. Get rightholders from org after delete";

const addUserGroup = "1. Add organization as user to another organization";
const resourceDelegationGroup = "2. Delegate a single resource to the added organization";
const cleanupGroup = "3. Cleanup - delete delegation and connection";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// get k6 options
export const options = getOptions(
    [
        addUserGroup,
        getRightholdersLabel1a,
        postRightholderLabel,
        getRightholdersLabel1c,
        getRightholdersLabel1d,
        getRightholdersLabel1e,
        getIsHovedAdminLabel,
        getRolePermissionsLabel,
        getDelegationsLabel,
        getDelegatedResourcesLabel,
        searchAccessPackagesLabel,
        searchResourcesLabel,
        getResourceOwnersLabel,
        getOrganizationDataLabel,

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
        getDelegationCheckLabel3c,
        getRolePermissionsLabel3d,
        getRolePermissionsLabel3e,
        getRoleMetaLabel3f,
        getDelegationsLabel3g,
        deleteRightholderConnectionLabel,
        getRolePermissionsLabel3i,
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
        const tokenOpts = new PersonalTokenGeneratorOptions();;
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

    // Get from and to organizations and resource for the current iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Part 1.
    // Add organization as user to another organization,
    group(addUserGroup, function () {
        PostRightholder(connectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        let queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1a);
        queryParams = {
            party: from.partyUuid,
            from: from.orgUuid,
            to: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1c);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1d);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            to: to.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1e);
        GetIsHovedAdmin(userApiClient, { party: from.orgUuid }, getIsHovedAdminLabel);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel);
        GetDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel);
        GetDelegatedResources(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel);
        SearchAccessPackages(userApiClient, { searchString: "", typeName: "organisasjon" }, searchAccessPackagesLabel);
        SearchResources(userApiClient, { Page: 1, ResultsPerPage: 7, searchString: "", includeA2Services: false }, searchResourcesLabel);
        GetResourceOwners(userApiClient, { undefined }, getResourceOwnersLabel);
        GetOrganizationData(userApiClient, {}, getOrganizationDataLabel);
    });


    // Part 2.
    // Delegate a single resource to the added organization and verify delegation
    group(resourceDelegationGroup, function () {
        SearchAccessPackages(userApiClient, { searchString: resource.searchTerm, typeName: "organisasjon" }, searchAccessPackagesLabel2a);
        const rightsMeta = GetRightsMeta(userApiClient, { resource: resource.resourceId }, getRightsMetadataLabel2b);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel);
        PostSingleRight(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: resource.resourceId }, getRights(rightsMeta), postDelegationLabel);
        GetDelegatedResources(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel2d);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel2e);
        GetDelegatedRightsForResource(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: resource.resourceId }, getDelegatedRightsForResourceLabel2f);
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed,
    // then clean up by deleting the rightholder connection between the organizations and verify deletion
    group(cleanupGroup, function () {
        RevokeSingleRight(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: resource.resourceId }, revokeSingleRightLabel);
        GetDelegatedResources(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel3b);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel3c);
        GetDelegatedRightsForResource(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: resource.resourceId }, getRolePermissionsLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel3d);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel3e);
        GetRoleMeta(userApiClient, {}, getRoleMetaLabel3f);
        GetDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel3g);
        DeleteRightholder(connectionsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, deleteRightholderConnectionLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel3i);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel3j);
        GetRoleMeta(userApiClient, {}, getRoleMetaLabel3k);
        GetDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel3l);
        let queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
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
