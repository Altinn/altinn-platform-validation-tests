import { group } from "k6";
import exec from "k6/execution";
import http from "k6/http";

import { AccessPackageClient as BffAccessPackageApiClient } from "../../../clients/access-management-bff/access-package/index.js";
import { ConnectionClient as BffConnectionsApiClient } from "../../../clients/access-management-bff/connection/index.js";
import { SingleRightClient as BffSingleRightApiClient } from "../../../clients/access-management-bff/single-right/index.js";
import { UserClient as BffUserClient } from "../../../clients/access-management-bff/user/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { GetAccessPackageDelegations } from "../../building-blocks/access-management-bff/access-package/index.js";
import { GetAccessPackageDelegationCheck, SearchAccessPackages } from "../../building-blocks/access-management-bff/access-package/index.js";
import {
    GetOrgData,
} from "../../building-blocks/access-management-bff/altinn-cdn/index.js";
import { CreateRightHolder, DeleteReporteeConnection, GetRightHolders } from "../../building-blocks/access-management-bff/connection/index.js";
import { GetResourceOwners, SearchResources } from "../../building-blocks/access-management-bff/resource/index.js";
import { GetRolePermissions, } from "../../building-blocks/access-management-bff/role/index.js";
import { GetRoles, } from "../../building-blocks/access-management-bff/role/index.js";
import { RevokeSingleRights } from "../../building-blocks/access-management-bff/single-right/index.js";
import { DelegateSingleRights } from "../../building-blocks/access-management-bff/single-right/index.js";
import { GetRightsMeta } from "../../building-blocks/access-management-bff/single-right/index.js";
import { GetResourceRights } from "../../building-blocks/access-management-bff/single-right/index.js";
import { GetIsHovedadmin } from "../../building-blocks/access-management-bff/user/index.js";
import { getFromTo, getTokenOpts, } from "./commons.js";
import { resourcesForOrg as resources } from "./custom-data.js";

// Labels for different actions
const getRightholdersLabel1a = { step: "1a. Get rightholders from org" };
const postRightholderLabel = { step: "1b. Connecting organizations with PostRightholder" };
const getRightholdersLabel1c = { step: "1c. Get rightholders org -> dagl" };
const getRightholdersLabel1d = { step: "1d. Get rightholders from org" };
const getRightholdersLabel1e = { step: "1e. Get rightholders from org to org" };
const getIsHovedAdminLabel = { step: "1f. Get is hovedadmin for org" };
const getRolePermissionsLabel = { step: "1g. Get role permissions for org to org" };
const getDelegationsLabel = { step: "1h. Get delegations from org to org" };
const getDelegatedResourcesLabel = { step: "1i. Get delegated resources from org to org" };
const searchAccessPackagesLabel = { step: "1j. Search access packages for org" };
const searchResourcesLabel = { step: "1k. Search resources for org" };
const getResourceOwnersLabel = { step: "1l. Get resource owners for org" };
const getOrganizationDataLabel = { step: "1m. Get organization data for org" };

const searchAccessPackagesLabel2a = { step: "2a. Search access packages for org" };
const getRightsMetadataLabel2b = { step: "2b. Get rights metadata for resource" };
const getDelegationCheckLabel = { step: "2c. Get delegation check for client delegation" };
const postDelegationLabel = { step: "2d. Delegate serviceresource from org to org" };
const getDelegatedResourcesLabel2d = { step: "2e. Get delegated resources for client delegation" };
const getDelegationCheckLabel2e = { step: "2f. Get delegation check for client delegation after delegating" };
const getDelegatedRightsForResourceLabel2f = { step: "2g. Get delegated rights for resource for client delegation" };

const revokeSingleRightLabel = { step: "3a. Revoke single right for client delegation" };
const getDelegatedResourcesLabel3b = { step: "3b. Get delegated resources for client delegation after revoking single right" };
const getDelegationCheckLabel3c = { step: "3c. Get delegation check for client delegation after revoking single right" };
const getRolePermissionsLabel3d = { step: "3d. Get role permissions for user to org" };
const getRolePermissionsLabel3e = { step: "3e. Get role permissions for org to org" };
const getRoleMetaLabel3f = { step: "3f. Get role meta before revoking single right" };
const getDelegationsLabel3g = { step: "3g. Get delegations from org to org" };
const deleteRightholderConnectionLabel = { step: "3h. Delete rightholder connection between orgs" };
const getRolePermissionsLabel3i = { step: "3i. Get role permissions for user to org after delete" };
const getRolePermissionsLabel3j = { step: "3j. Get role permissions for org to org after delete" };
const getRoleMetaLabel3k = { step: "3k. Get role meta after revoking single right" };
const getDelegationsLabel3l = { step: "3l. Get delegations from org to org after delete" };
const getRightholdersLabel3m = { step: "3m. Get rightholders from org after delete" };

const addUserGroup = { group: "1. Add organization as user to another organization" };
const resourceDelegationGroup = { group: "2. Delegate a single resource to the added organization" };
const cleanupGroup = { group: "3. Cleanup - delete delegation and connection" };

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

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * @type {BffConnectionsApiClient | undefined}
 */
let connectionsApiClient = undefined;

/**
 * @type {BffAccessPackageApiClient | undefined}
 */
let accessPackageApiClient = undefined;

/**
 * @type {BffSingleRightApiClient | undefined}
 */
let singleRightsApiClient = undefined;

/**
 * @type {BffUserClient | undefined}
 */
let userApiClient = undefined;

/**
 * Creates and caches the API clients used by the test.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * BffConnectionsApiClient,
 * BffAccessPackageApiClient,
 * BffSingleRightApiClient,
 * BffUserClient,
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
        connectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (singleRightsApiClient == undefined) {
        singleRightsApiClient = new BffSingleRightApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (userApiClient == undefined) {
        userApiClient = new BffUserClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    return [
        connectionsApiClient,
        accessPackageApiClient,
        singleRightsApiClient,
        userApiClient,
        tokenGenerator,
    ];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns TODO: description
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/delegation/${__ENV.ENVIRONMENT}/single-service-org-org.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param segmentedData TODO: description
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
    group(addUserGroup.group, function () {
        CreateRightHolder(connectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        let queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        };
        GetRightHolders(connectionsApiClient, queryParams, getRightholdersLabel1a);
        queryParams = {
            party: from.partyUuid,
            from: from.orgUuid,
            to: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetRightHolders(connectionsApiClient, queryParams, getRightholdersLabel1c);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        };
        GetRightHolders(connectionsApiClient, queryParams, getRightholdersLabel1d);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            to: to.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        };
        GetRightHolders(connectionsApiClient, queryParams, getRightholdersLabel1e);
        GetIsHovedadmin(userApiClient, { party: from.orgUuid }, getIsHovedAdminLabel);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel);
        GetAccessPackageDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel);
        GetResourceRights(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel);
        SearchAccessPackages(userApiClient, { searchString: "", typeName: "organisasjon" }, searchAccessPackagesLabel);
        SearchResources(userApiClient, { Page: 1, ResultsPerPage: 7, searchString: "", includeA2Services: false }, searchResourcesLabel);
        GetResourceOwners(userApiClient, { undefined }, getResourceOwnersLabel);
        GetOrgData(userApiClient, {}, getOrganizationDataLabel);
    });

    // Part 2.
    // Delegate a single resource to the added organization and verify delegation
    group(resourceDelegationGroup.group, function () {
        SearchAccessPackages(userApiClient, { searchString: resource.searchTerm, typeName: "organisasjon" }, searchAccessPackagesLabel2a);
        const rightsMeta = GetRightsMeta(userApiClient, { resource: resource.resourceId }, getRightsMetadataLabel2b);
        GetAccessPackageDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel);
        DelegateSingleRights(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: resource.resourceId }, getRights(rightsMeta), postDelegationLabel);
        GetResourceRights(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel2d);
        GetAccessPackageDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel2e);
        GetResourceRights(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: resource.resourceId }, getDelegatedRightsForResourceLabel2f);
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed,
    // then clean up by deleting the rightholder connection between the organizations and verify deletion
    group(cleanupGroup.group, function () {
        RevokeSingleRights(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: resource.resourceId }, revokeSingleRightLabel);
        GetResourceRights(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel3b);
        GetAccessPackageDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: resource.resourceId }, getDelegationCheckLabel3c);
        GetResourceRights(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: resource.resourceId }, getRolePermissionsLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel3d);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel3e);
        GetRoles(userApiClient, {}, getRoleMetaLabel3f);
        GetAccessPackageDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel3g);
        DeleteReporteeConnection(connectionsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, deleteRightholderConnectionLabel);
        GetRolePermissions(userApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel3i);
        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel3j);
        GetRoles(userApiClient, {}, getRoleMetaLabel3k);
        GetAccessPackageDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegationsLabel3l);
        let queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        };
        GetRightHolders(connectionsApiClient, queryParams, getRightholdersLabel3m);
    });

}

/**
 * Helper function to extract rights from rights metadata response
 *
 * @param rightsMeta TODO: description
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
