import { group } from "k6";
import exec from "k6/execution";
import http from "k6/http";

import {
    AccessPackageClient,
    GetAccessPackageDelegationsQueryBuilder,
    SearchAccessPackagesQueryBuilder,
} from "../../../clients/access-management-bff/access-package/index.js";
import { AltinnCdnClient } from "../../../clients/access-management-bff/altinn-cdn/index.js";
import {
    ConnectionClient,
    CreateRightHolderQueryBuilder,
    DeleteReporteeConnectionQueryBuilder,
    GetRightHoldersQueryBuilder,
} from "../../../clients/access-management-bff/connection/index.js";
import {
    ResourceClient,
    SearchResourcesQueryBuilder,
} from "../../../clients/access-management-bff/resource/index.js";
import {
    GetRolePermissionsQueryBuilder,
    RoleClient,
} from "../../../clients/access-management-bff/role/index.js";
import {
    DelegateSingleRightsQueryBuilder,
    GetResourceRightsQueryBuilder,
    GetRightsMetaQueryBuilder,
    GetSingleRightDelegationCheckQueryBuilder,
    RevokeSingleRightsQueryBuilder,
    SingleRightClient,
} from "../../../clients/access-management-bff/single-right/index.js";
import { UserClient } from "../../../clients/access-management-bff/user/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, getOptions, parseCsvData, requireEnv, segmentData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { GetAccessPackageDelegations } from "../../building-blocks/access-management-bff/access-package/index.js";
import { SearchAccessPackages } from "../../building-blocks/access-management-bff/access-package/index.js";
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
import { GetSingleRightDelegationCheck } from "../../building-blocks/access-management-bff/single-right/index.js";
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
 * @type {ConnectionClient | undefined}
 */
let connectionsApiClient = undefined;

/**
 * @type {AccessPackageClient | undefined}
 */
let accessPackageApiClient = undefined;

/**
 * @type {SingleRightClient | undefined}
 */
let singleRightsApiClient = undefined;

/**
 * @type {UserClient | undefined}
 */
let userApiClient = undefined;

/**
 * @type {RoleClient | undefined}
 */
let roleApiClient = undefined;

/**
 * @type {ResourceClient | undefined}
 */
let resourceApiClient = undefined;

/**
 * @type {AltinnCdnClient | undefined}
 */
let altinnCdnApiClient = undefined;

/**
 * Creates and caches the API clients used by the test.
 *
 * All clients share the same {@link PersonalTokenGenerator} instance.
 * Existing instances are reused on subsequent calls.
 *
 * @returns {[
 * ConnectionClient,
 * AccessPackageClient,
 * SingleRightClient,
 * UserClient,
 * RoleClient,
 * ResourceClient,
 * AltinnCdnClient,
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

    if (singleRightsApiClient == undefined) {
        singleRightsApiClient = new SingleRightClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (userApiClient == undefined) {
        userApiClient = new UserClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (roleApiClient == undefined) {
        roleApiClient = new RoleClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (resourceApiClient == undefined) {
        resourceApiClient = new ResourceClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    if (altinnCdnApiClient == undefined) {
        altinnCdnApiClient = new AltinnCdnClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    return [
        connectionsApiClient,
        accessPackageApiClient,
        singleRightsApiClient,
        userApiClient,
        roleApiClient,
        resourceApiClient,
        altinnCdnApiClient,
        tokenGenerator,
    ];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations to delegate between, one slice per VU.
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
 * @param {object[][]} segmentedData Organizations to delegate between, one slice per VU.
 */
export default function (segmentedData) {
    const [
        connectionsApiClient,
        accessPackageApiClient,
        singleRightsApiClient,
        userApiClient,
        roleApiClient,
        resourceApiClient,
        altinnCdnApiClient,
        tokenGenerator,
    ] = getClients();

    // Get from and to organizations and resource for the current iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Part 1.
    // Add organization as user to another organization,
    group(addUserGroup.group, function () {
        CreateRightHolder(
            connectionsApiClient,
            from.orgUuid,
            new CreateRightHolderQueryBuilder()
                .withRightholderPartyUuid(to.orgUuid)
                .build(),
            postRightholderLabel,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(false)
                .build(),
            getRightholdersLabel1a,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.orgUuid)
                .withTo(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersLabel1c,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(false)
                .build(),
            getRightholdersLabel1d,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersLabel1e,
        );
        GetIsHovedadmin(userApiClient, { party: from.orgUuid }, getIsHovedAdminLabel);
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getRolePermissionsLabel,
        );
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegationsLabel,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegatedResourcesLabel,
        );
        SearchAccessPackages(
            accessPackageApiClient,
            new SearchAccessPackagesQueryBuilder()
                .withSearchString("")
                .withTypeName("organisasjon")
                .build(),
            searchAccessPackagesLabel,
        );
        SearchResources(
            resourceApiClient,
            new SearchResourcesQueryBuilder()
                .withPage(1)
                .withResultsPerPage(7)
                .withSearchString("")
                .withIncludeA2Services(false)
                .build(),
            searchResourcesLabel,
        );
        GetResourceOwners(resourceApiClient, null, getResourceOwnersLabel);
        GetOrgData(altinnCdnApiClient, getOrganizationDataLabel);
    });

    // Part 2.
    // Delegate a single resource to the added organization and verify delegation
    group(resourceDelegationGroup.group, function () {
        SearchAccessPackages(
            accessPackageApiClient,
            new SearchAccessPackagesQueryBuilder()
                .withSearchString(resource.searchTerm)
                .withTypeName("organisasjon")
                .build(),
            searchAccessPackagesLabel2a,
        );
        const rightsMeta = GetRightsMeta(
            singleRightsApiClient,
            new GetRightsMetaQueryBuilder()
                .withResource(resource.resourceId)
                .build(),
            getRightsMetadataLabel2b,
        );
        GetSingleRightDelegationCheck(
            singleRightsApiClient,
            new GetSingleRightDelegationCheckQueryBuilder()
                .withFrom(from.orgUuid)
                .withResource(resource.resourceId)
                .build(),
            getDelegationCheckLabel,
        );
        DelegateSingleRights(
            singleRightsApiClient,
            new DelegateSingleRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withResourceId(resource.resourceId)
                .build(),
            getRights(rightsMeta),
            postDelegationLabel,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegatedResourcesLabel2d,
        );
        GetSingleRightDelegationCheck(
            singleRightsApiClient,
            new GetSingleRightDelegationCheckQueryBuilder()
                .withFrom(from.orgUuid)
                .withResource(resource.resourceId)
                .build(),
            getDelegationCheckLabel2e,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withResourceId(resource.resourceId)
                .build(),
            getDelegatedRightsForResourceLabel2f,
        );
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed,
    // then clean up by deleting the rightholder connection between the organizations and verify deletion
    group(cleanupGroup.group, function () {
        RevokeSingleRights(
            singleRightsApiClient,
            new RevokeSingleRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withResourceId(resource.resourceId)
                .build(),
            revokeSingleRightLabel,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegatedResourcesLabel3b,
        );
        GetSingleRightDelegationCheck(
            singleRightsApiClient,
            new GetSingleRightDelegationCheckQueryBuilder()
                .withFrom(from.orgUuid)
                .withResource(resource.resourceId)
                .build(),
            getDelegationCheckLabel3c,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .withResourceId(resource.resourceId)
                .build(),
            getRolePermissionsLabel,
        );
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.orgUuid)
                .withTo(from.partyUuid)
                .build(),
            getRolePermissionsLabel3d,
        );
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getRolePermissionsLabel3e,
        );
        GetRoles(roleApiClient, getRoleMetaLabel3f);
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegationsLabel3g,
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
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.orgUuid)
                .withTo(from.partyUuid)
                .build(),
            getRolePermissionsLabel3i,
        );
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getRolePermissionsLabel3j,
        );
        GetRoles(roleApiClient, getRoleMetaLabel3k);
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withTo(to.orgUuid)
                .build(),
            getDelegationsLabel3l,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(false)
                .build(),
            getRightholdersLabel3m,
        );
    });

}

/**
 * Helper function to extract rights from rights metadata response
 *
 * @param {Array<Right>} rightsMeta The rights the resource defines, as returned
 * by GetRightsMeta.
 * @returns list of rights
 */
function getRights(rightsMeta) {
    const rights = [];
    for (const right of rightsMeta) {
        rights.push(right.key);
    }
    return rights;
}
