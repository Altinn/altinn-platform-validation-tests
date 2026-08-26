import { group } from "k6";
import exec from "k6/execution";

import { GetAccessPackageDelegationCheckQueryBuilder } from "../../../../clients/access-management-bff/access-package/index.js";
import { GetRightHoldersQueryBuilder } from "../../../../clients/access-management-bff/connection/index.js";
import {
    CreateInstanceRightsQueryBuilder,
    GetInstanceDelegationCheckQueryBuilder,
    GetInstanceDelegationsQueryBuilder,
} from "../../../../clients/access-management-bff/instance/index.js";
import { GetResourceQueryBuilder } from "../../../../clients/access-management-bff/resource/index.js";
import { GetRolePermissionsQueryBuilder } from "../../../../clients/access-management-bff/role/index.js";
import { GetRightsMetaQueryBuilder } from "../../../../clients/access-management-bff/single-right/index.js";
import { DialogByIdVariablesBuilder, DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/index.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, requireEnv, segmentData } from "../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../building-blocks/access-management-bff/access-package/index.js";
import { GetOrgData } from "../../../building-blocks/access-management-bff/altinn-cdn/index.js";
import { GetRightHolders } from "../../../building-blocks/access-management-bff/connection/index.js";
import { GetActiveConsents } from "../../../building-blocks/access-management-bff/consent/index.js";
import { GetInstanceDelegationCheck } from "../../../building-blocks/access-management-bff/instance/index.js";
import { GetInstanceDelegations } from "../../../building-blocks/access-management-bff/instance/index.js";
import { CreateInstanceRights } from "../../../building-blocks/access-management-bff/instance/index.js";
import { GetParty } from "../../../building-blocks/access-management-bff/lookup/index.js";
import { GetResource } from "../../../building-blocks/access-management-bff/resource/index.js";
import { GetRolePermissions } from "../../../building-blocks/access-management-bff/role/index.js";
import { GetRightsMeta } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { GetPendingSystemUsers } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { GetActorList, GetActorListOld, GetIsAdmin, GetIsClientAdmin, GetIsCompanyProfileAdmin, GetIsInstanceAdmin, GetReportee, GetUserProfile } from "../../../building-blocks/access-management-bff/user/index.js";
import { GetAllDialogsForPartyCheckForDialogId, GetAndVerifyDialogById } from "../../../building-blocks/dialogporten/graphql/index.js";
import { CreateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, getDialogportenOpts, getFromTo, getInstanceDelegationBody, getTokenOpts } from "./commons.js";

// serviceowner which will create a dialog.
// The yt serviceOwner is different from the other environments.
let serviceOwnerOrgNo = "991825827";
if (__ENV.ENVIRONMENT === "yt01") {
    serviceOwnerOrgNo = "713431400";
}

// List of resources to test with. Use only one for now,
// make sure to have the resource created in the environment before running the test, and that the service owner owns it,
// and that it is delegable (see the "delegable" property when getting the resource by id in the access management API).
const resources = [
    "k6-instancedelegation-test",
];

// Use unique laber for each request to be able to check them separately in the results.
// Number them to make sumary report easier to read and to be able to see the flow of the test in the results.
const group0Label = "Group 0 - Create dialog";
const group1Label = "Group 1 - Open access management";
const group2Label = "Group 2 - Delegate rights for resource and instance";
const group3Label = "Group 3 - Check delegated dialog is visible for delegated user";

const createDialog = { step: "0. Create dialog" };

const partOneLabel = { step: "1 - Get user info and access management data for user" };
const getLookupPartyUserLabel = { step: "1a. Get lookup party user for ssn" };
const getIsCompanyProfileAdminLabel = { step: "1b. Get is company profile admin" };
const getReporteeLabel = { step: "1c. Get reportee for user" };
const getProfileLabel = { step: "1d. Get profile for user" };
const getIsAdminLabel = { step: "1e. Get is admin for user" };
const getIsClientAdminLabel = { step: "1f. Get is client admin for user" };
const getActorListOldLabel = { step: "1g. Get actor list old for user" };
const getActorListFavoritesLabel = { step: "1h. Get actor list favorites for user" };
const getOrganizationDataLabel = { step: "1i. Get organization data for user" };
const getIsInstanceAdminLabel = { step: "1j. Get is instance admin for user" };
const getDelegatedInstancesForResourceLabel = { step: "1k. Get delegated instances for resource for user" };
const getActiveConsentLabel = { step: "1l. Get active consent for user" };
const getConnectionsLabel = { step: "1m. Get connections for user" };
const getResourceByIdLabel = { step: "1n. Get resource by id for user" };
const getDelegationCheckLabel = { step: "1o. Get delegation check for resource and instance for user" };
const getConnectionsWithTo = { step: "1p. Get connections for user with to parameter" };
const getRolePermissionsLabel = { step: "1q. Get role permissions for user from and to" };
const GetPendingDelegationsForUserLabel = { step: "1r. Get pending delegations for user" };

const partTwoLabel = { step: "2 - Get access management data for user and resource" };
const getRightsMetaLabel = { step: "2a. Get rights meta for resource" };
const checkDelegationForResourceLabel = { step: "2b. Check delegation for resource and instance for user" };
const delegateRightsForResourceLabel = { step: "2c. Delegate rights for resource and instance for user" };
const getDelegatedInstancesForResourceAfterLabel = { step: "2d. Get delegated instances for resource for user after delegation" };
const checkDelegationForResourceLabelAfter = { step: "2e. Check delegation for resource and instance for user after delegation" };
const getConnectionsWithToAfter = { step: "2f. Get connections for user with to parameterafter delegation" };
const getConnectionsLabelAfter = { step: "2g. Get connections for user after delegation" };

const partThreeLabel = { step: "3 - Check delegated dialog is visible for delegated user" };
const getDialogByIdLabel = { step: "3a. Get dialog by id for delegated user" };
const getAllDialogsForPartyLabel = { step: "3b. Get all dialogs for party for delegated user" };

export const options = getOptions([
    createDialog,

    partOneLabel,
    getLookupPartyUserLabel,
    getIsCompanyProfileAdminLabel,
    getReporteeLabel,
    getProfileLabel,
    getIsAdminLabel,
    getIsClientAdminLabel,
    getActorListOldLabel,
    getActorListFavoritesLabel,
    getIsInstanceAdminLabel,
    getOrganizationDataLabel,
    getDelegatedInstancesForResourceLabel,
    getActiveConsentLabel,
    getConnectionsLabel,
    getResourceByIdLabel,
    getDelegationCheckLabel,
    getConnectionsWithTo,
    getRolePermissionsLabel,
    GetPendingDelegationsForUserLabel,

    partTwoLabel,
    getRightsMetaLabel,
    checkDelegationForResourceLabel,
    delegateRightsForResourceLabel,
    getDelegatedInstancesForResourceAfterLabel,
    checkDelegationForResourceLabelAfter,
    getConnectionsWithTo,
    getConnectionsWithToAfter,
    getConnectionsLabelAfter,

    partThreeLabel,
    getDialogByIdLabel,
    getAllDialogsForPartyLabel,
], [group0Label, group1Label, group2Label, group3Label]
);

/**
 * Setup function to segment data for VUs.
 *
 * @returns {any[][]} Organizations with their daglig leder, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management-bff/instance-delegation/${__ENV.ENVIRONMENT}/org-user.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function to test instance delegation from user to user.
 * The test will create a dialog, then delegate it to another user,
 * and check that the delegation is successful by calling the same endpoints as
 * the browser would do when navigating in the access management UI.
 * Finally, check that the delegated dialog is visible for the delegated user
 * by using the dialogporten graphql API to get the dialog by id.
 * (The groups are not used for anything else than to be able to see the flow of the test)
 *
 * @param {any[][]} data Organizations with their daglig leder, one slice per VU.
 */
export default function (data) {
    const {
        serviceOwner: serviceOwnerApiClient,
        user: userApiClient,
        lookup: lookupApiClient,
        altinnCdn: altinnCdnApiClient,
        role: roleApiClient,
        instance: instanceApiClient,
        consent: consentApiClient,
        systemUser: systemUserApiClient,
        resource: resourceApiClient,
        singleRight: singleRightApiClient,
        connection: bffConnectionsApiClient,
        accessPackage: bffAccessPackageApiClient,
        graphql: graphqlClient,
        tokenGenerator,
    } = getClients(serviceOwnerOrgNo);
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources);
    // create a dialog to have an instance to delegate on, and to be able to test with a realistic instance in the access management API
    const dialogId = group(group0Label, function () {
        return CreateDialog(
            serviceOwnerApiClient,
            from.orgNo,
            resource,
            serviceOwnerOrgNo,
            createDialog,
            false,
        );
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Open access management after creating the dialog.
    // Call every bff endpoint that the browser uses when navigating from arbeidsflate/del og gi tilgang
    group(group1Label, function () {
        GetParty(lookupApiClient, from.partyUuid, getLookupPartyUserLabel);
        GetIsCompanyProfileAdmin(userApiClient, from.orgUuid, getIsCompanyProfileAdminLabel);
        GetReportee(userApiClient, from.partyUuid, getReporteeLabel);
        GetUserProfile(userApiClient, getProfileLabel);
        GetIsAdmin(userApiClient, from.orgUuid, getIsAdminLabel);
        GetIsClientAdmin(userApiClient, from.orgUuid, getIsClientAdminLabel);
        GetActorListOld(userApiClient, getActorListOldLabel);
        GetActorList(userApiClient, getActorListFavoritesLabel);
        GetRolePermissions(
            roleApiClient,
            new GetRolePermissionsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.orgUuid)
                .withTo(from.partyUuid)
                .build(),
            getRolePermissionsLabel,
        );
        GetOrgData(altinnCdnApiClient, getOrganizationDataLabel);
        GetIsInstanceAdmin(userApiClient, from.orgUuid, getIsInstanceAdminLabel);
        GetInstanceDelegations(
            instanceApiClient,
            new GetInstanceDelegationsQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withResource(resource)
                .withInstance(`urn:altinn:dialog-id:${dialogId}`)
                .build(),
            getDelegatedInstancesForResourceLabel,
        );
        GetActiveConsents(consentApiClient, from.orgUuid, getActiveConsentLabel);
        GetPendingSystemUsers(systemUserApiClient, from.orgUuid, GetPendingDelegationsForUserLabel);
        GetRightHolders(
            bffConnectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getConnectionsLabel,
        );
        GetResource(
            resourceApiClient,
            new GetResourceQueryBuilder()
                .withResourceId(resource)
                .build(),
            getResourceByIdLabel,
        );
        GetAccessPackageDelegationCheck(
            bffAccessPackageApiClient,
            new GetAccessPackageDelegationCheckQueryBuilder()
                .withParty(from.partyUuid)
                .build(),
            getDelegationCheckLabel,
        );
        GetRightHolders(
            bffConnectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.partyUuid)
                .withTo(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getConnectionsWithTo,
        );
    });

    // Delegate dialog to other user.
    // Calls every bff as the browser would do
    group(group2Label, function () {
        const rightsMeta = GetRightsMeta(
            singleRightApiClient,
            new GetRightsMetaQueryBuilder()
                .withResource(resource)
                .build(),
            getRightsMetaLabel,
        );
        GetInstanceDelegationCheck(
            instanceApiClient,
            new GetInstanceDelegationCheckQueryBuilder()
                .withParty(from.orgUuid)
                .withResource(resource)
                .withInstance(`urn:altinn:dialog-id:${dialogId}`)
                .build(),
            checkDelegationForResourceLabel,
        );
        CreateInstanceRights(
            instanceApiClient,
            new CreateInstanceRightsQueryBuilder()
                .withParty(from.orgUuid)
                .withResource(resource)
                .withInstance(`urn:altinn:dialog-id:${dialogId}`)
                .build(),
            getInstanceDelegationBody(rightsMeta, to),
            delegateRightsForResourceLabel,
        );
        GetInstanceDelegations(
            instanceApiClient,
            new GetInstanceDelegationsQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withResource(resource)
                .withInstance(`urn:altinn:dialog-id:${dialogId}`)
                .build(),
            getDelegatedInstancesForResourceAfterLabel,
        );
        GetInstanceDelegationCheck(
            instanceApiClient,
            new GetInstanceDelegationCheckQueryBuilder()
                .withParty(from.orgUuid)
                .withResource(resource)
                .withInstance(`urn:altinn:dialog-id:${dialogId}`)
                .build(),
            checkDelegationForResourceLabelAfter,
        );
        GetRightHolders(
            bffConnectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.partyUuid)
                .withFrom(from.orgUuid)
                .withTo(from.partyUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getConnectionsWithToAfter,
        );
        GetRightHolders(
            bffConnectionsApiClient,
            new GetRightHoldersQueryBuilder()
                .withParty(from.orgUuid)
                .withFrom(from.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            getConnectionsLabelAfter,
        );
    });

    // Finally, check that the delegated dialog is visible for the delegated user by
    // using the dialogporten graphql API to get the dialog by id, and to get all dialogs for party
    // and check that the dialog is there. This is to verify that the delegation is working end to end,
    // and that the delegated user can see the dialog in their list of dialogs and access it.
    group(group3Label, function () {
        tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(to.ssn));
        const variables = new DialogSearchVariablesBuilder()
            .withParties([from.orgNo])
            .build();
        GetAllDialogsForPartyCheckForDialogId(graphqlClient, variables, dialogId, getAllDialogsForPartyLabel);
        const getDialogByIdVariables = new DialogByIdVariablesBuilder()
            .withId(dialogId)
            .build();
        GetAndVerifyDialogById(graphqlClient, getDialogByIdVariables, getDialogByIdLabel);
    });
}
