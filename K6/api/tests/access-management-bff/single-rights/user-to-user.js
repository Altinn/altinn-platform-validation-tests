import { group } from "k6";
import exec from "k6/execution";

import {
    AccessPackageClient,
    GetAccessPackageDelegationsQueryBuilder,
    SearchAccessPackagesQueryBuilder,
} from "../../../../clients/access-management-bff/access-package/index.js";
import {
    ConnectionClient,
    DeleteReporteeConnectionQueryBuilder,
    GetRightHoldersQueryBuilder,
    ValidatePersonInputBuilder,
} from "../../../../clients/access-management-bff/connection/index.js";
import {
    ResourceClient,
    SearchResourcesQueryBuilder,
} from "../../../../clients/access-management-bff/resource/index.js";
import {
    GetRolePermissionsQueryBuilder,
    RoleClient,
} from "../../../../clients/access-management-bff/role/index.js";
import {
    DelegateSingleRightsQueryBuilder,
    GetResourceDelegationsQueryBuilder,
    GetResourceRightsQueryBuilder,
    GetRightsMetaQueryBuilder,
    GetSingleRightDelegationCheckQueryBuilder,
    RevokeSingleRightsQueryBuilder,
    SingleRightClient,
} from "../../../../clients/access-management-bff/single-right/index.js";
import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { GetAccessPackageDelegations } from "../../../building-blocks/access-management-bff/access-package/index.js";
import { SearchAccessPackages } from "../../../building-blocks/access-management-bff/access-package/index.js";
import { CreateRightHolder, DeleteReporteeConnection, GetRightHolders } from "../../../building-blocks/access-management-bff/connection/index.js";
import { GetResourceOwners } from "../../../building-blocks/access-management-bff/resource/index.js";
import { SearchResources } from "../../../building-blocks/access-management-bff/resource/index.js";
import { GetRoles } from "../../../building-blocks/access-management-bff/role/index.js";
import { GetRolePermissions } from "../../../building-blocks/access-management-bff/role/index.js";
import { GetSingleRightDelegationCheck } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { GetResourceRights } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { GetResourceDelegations } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { GetRightsMeta } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { DelegateSingleRights, RevokeSingleRights } from "../../../building-blocks/access-management-bff/single-right/index.js";
import {
    GetIsHovedadmin,
} from "../../../building-blocks/access-management-bff/user/index.js";
import { resourcesForUsers as resources } from "../custom-data.js";
import { getFromTo, getTokenOpts, } from "./commons.js";

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

const addUserGroup = { group: "1. ********* Connect ********" };
const resourceDelegationGroup = { group: "2. ******** Delegate  ********" };
const cleanupGroup = { group: "3. ********* Cleanup  *********" };

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

    return [
        connectionsApiClient,
        accessPackageApiClient,
        singleRightsApiClient,
        userApiClient,
        roleApiClient,
        resourceApiClient,
        tokenGenerator,
    ];
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Users to delegate between, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`authentication/delegation/${__ENV.ENVIRONMENT}/single-service-user-user.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 *
 * @param {object[][]} segmentedData Users to delegate between, one slice per VU.
 */
export default function (segmentedData) {
    const [
        connectionsApiClient,
        accessPackageApiClient,
        singleRightsApiClient,
        userApiClient,
        roleApiClient,
        resourceApiClient,
        tokenGenerator,
    ] = getClients();

    // Get from and to users and resource for the current iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Part 1.
    // Add user to auser,
    group(addUserGroup.group, function () {
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
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersLabel1a,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersLabel1c,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getRightholdersLabel1d,
        );
        GetIsHovedadmin(userApiClient, from.partyUuid, getIsHovedAdminLabel);
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getRolePermissionsLabel,
        );
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegationsLabel,
        );
        GetResourceDelegations(
            singleRightsApiClient,
            new GetResourceDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegatedResourcesLabel,
        );
        SearchAccessPackages(
            accessPackageApiClient,
            new SearchAccessPackagesQueryBuilder()
                .withSearchString("")
                .withTypeName("person")
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
    });

    // Part 2.
    // Delegate a single resource to the added user and verify delegation
    group(resourceDelegationGroup.group, function () {
        SearchAccessPackages(
            accessPackageApiClient,
            new SearchAccessPackagesQueryBuilder()
                .withSearchString(resource.searchTerm)
                .withTypeName("person")
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
                .withFrom(from.partyUuid)
                .withResource(resource.resourceId)
                .build(),
            getDelegationCheckLabel,
        );
        DelegateSingleRights(
            singleRightsApiClient,
            new DelegateSingleRightsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withResourceId(resource.resourceId)
                .build(),
            getRights(rightsMeta),
            postDelegationLabel,
        );
        GetResourceDelegations(
            singleRightsApiClient,
            new GetResourceDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegatedResourcesLabel2e,
        );
        GetSingleRightDelegationCheck(
            singleRightsApiClient,
            new GetSingleRightDelegationCheckQueryBuilder()
                .withFrom(from.partyUuid)
                .withResource(resource.resourceId)
                .build(),
            getDelegationCheckLabel2f,
        );
        GetResourceRights(
            singleRightsApiClient,
            new GetResourceRightsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withResourceId(resource.resourceId)
                .build(),
            getDelegatedRightsForResourceLabel2g,
        );
    });

    // Part 3.
    // Revoke the delegated resource and verify that the delegation has been removed,
    // then clean up by deleting the rightholder connection between the users and verify deletion
    group(cleanupGroup.group, function () {
        RevokeSingleRights(
            singleRightsApiClient,
            new RevokeSingleRightsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .withResourceId(resource.resourceId)
                .build(),
            revokeSingleRightLabel,
        );
        GetResourceDelegations(
            singleRightsApiClient,
            new GetResourceDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegatedResourcesLabel3b,
        );
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getRolePermissionsLabel3d,
        );
        GetRoles(roleApiClient, getRoleMetaLabel3f);
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegationsLabel3g,
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
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getRolePermissionsLabel3j,
        );
        GetRoles(roleApiClient, getRoleMetaLabel3k);
        GetAccessPackageDelegations(
            accessPackageApiClient,
            new GetAccessPackageDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(to.partyUuid)
                .build(),
            getDelegationsLabel3l,
        );
        GetRightHolders(
            connectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
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
