import exec from "k6/execution";
import { group } from "k6";
import { CreateDialog } from "../../../../building-blocks/dialogporten/serviceowner/index.js";
import { GetAllDialogsForPartyCheckForDialogId, GetAndVerifyDialogById } from "../../../../building-blocks/dialogporten/graphql/index.js";
import {
    GetLookupPartyUser,
    GetIsCompanyProfileAdmin,
    GetReportee,
    GetProfile,
    GetIsAdmin,
    GetIsClientAdmin,
    GetActorListOld,
    GetActorListFavorites,
    GetIsInstanceAdmin,
} from "../../../../building-blocks/authentication/instance-delegation/index.js";
import { GetDelegatedInstancesForResource, GetActiveConsent, GetResourceById, GetRightsMeta, DelegateRightsForResource, GetRolePermissions } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetOrganizationData, CheckDelegationForResource, GetRoleMeta, GetPendingDelegationsForUser } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetConnections } from "../../../../building-blocks/authentication/connections/index.js";
import { GetDelegationCheck } from "../../../../building-blocks/authentication/access-package/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { getTokenOpts, getFromTo, getClients, getDialogportenOpts, getInstanceDelegationBody } from "./commons.js";
export { setup } from "./commons.js";
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

const createDialog = "0. Create dialog";

const partOneLabel = "1 - Get user info and access management data for user";
const getLookupPartyUserLabel = "1a. Get lookup party user for ssn";
const getIsCompanyProfileAdminLabel = "1b. Get is company profile admin";
const getReporteeLabel = "1c. Get reportee for user";
const getProfileLabel = "1d. Get profile for user";
const getIsAdminLabel = "1e. Get is admin for user";
const getIsClientAdminLabel = "1f. Get is client admin for user";
const getActorListOldLabel = "1g. Get actor list old for user";
const getActorListFavoritesLabel = "1h. Get actor list favorites for user";
const getOrganizationDataLabel = "1i. Get organization data for user";
const getIsInstanceAdminLabel = "1j. Get is instance admin for user";
const getDelegatedInstancesForResourceLabel = "1k. Get delegated instances for resource for user";
const getActiveConsentLabel = "1l. Get active consent for user";
const getConnectionsLabel = "1m. Get connections for user";
const getResourceByIdLabel = "1n. Get resource by id for user";
const getDelegationCheckLabel = "1o. Get delegation check for resource and instance for user";
const getConnectionsWithTo = "1p. Get connections for user with to parameter";
const getRolePermissionsLabel = "1q. Get role permissions for user from and to";
const GetPendingDelegationsForUserLabel = "1r. Get pending delegations for user";

const partTwoLabel = "2 - Get access management data for user and resource";
const getRightsMetaLabel = "2a. Get rights meta for resource";
const checkDelegationForResourceLabel = "2b. Check delegation for resource and instance for user";
const delegateRightsForResourceLabel = "2c. Delegate rights for resource and instance for user";
const getDelegatedInstancesForResourceAfterLabel = "2d. Get delegated instances for resource for user after delegation";
const checkDelegationForResourceLabelAfter = "2e. Check delegation for resource and instance for user after delegation";
const getConnectionsWithToAfter = "2f. Get connections for user with to parameterafter delegation";
const getConnectionsLabelAfter = "2g. Get connections for user after delegation";

const partThreeLabel = "3 - Check delegated dialog is visible for delegated user";
const getDialogByIdLabel = "3a. Get dialog by id for delegated user";
const getAllDialogsForPartyLabel = "3b. Get all dialogs for party for delegated user";

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
 * Main function to test instance delegation from user to user.
 * The test will create a dialog, then delegate it to another user,
 * and check that the delegation is successful by calling the same endpoints as
 * the browser would do when navigating in the access management UI.
 * Finally, check that the delegated dialog is visible for the delegated user
 * by using the dialogporten graphql API to get the dialog by id.
 * (The groups are not used for anything else than to be able to see the flow of the test)
 */
export default function (data) {
    const [serviceOwnerApiClient, userApiClient, accessManagementApiClient, bffConnectionsApiClient, bffAccessPackageApiClient, graphqlClient, tokenGenerator] = getClients(serviceOwnerOrgNo);
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources);
    let dialogId = null;

    // create a dialog to have an instance to delegate on, and to be able to test with a realistic instance in the access management API
    group(group0Label, function () {
        const resp = CreateDialog(
            serviceOwnerApiClient,
            from.orgNo,
            resource,
            serviceOwnerOrgNo,
            createDialog,
            false,
            `Dialog created for instance delegation test with resource ${resource}`,
        );
        dialogId = JSON.parse(resp);
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Open access management after creating the dialog.
    // Call every bff endpoint that the browser uses when navigating from arbeidsflate/del og gi tilgang
    group(group1Label, function () {
        GetLookupPartyUser(userApiClient, getLookupPartyUserLabel);
        GetIsCompanyProfileAdmin(userApiClient, { party: from.orgUuid }, getIsCompanyProfileAdminLabel);
        GetReportee(userApiClient, from.partyId, getReporteeLabel);
        GetProfile(userApiClient, getProfileLabel);
        GetIsAdmin(userApiClient, { party: from.orgUuid }, getIsAdminLabel);
        GetIsClientAdmin(userApiClient, { party: from.orgUuid }, getIsClientAdminLabel);
        GetActorListOld(userApiClient, getActorListOldLabel);
        GetActorListFavorites(userApiClient, getActorListFavoritesLabel);
        GetRolePermissions(accessManagementApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel);
        GetOrganizationData(accessManagementApiClient, {}, getOrganizationDataLabel);
        GetIsInstanceAdmin(userApiClient, { party: from.orgUuid }, getIsInstanceAdminLabel);
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.partyUuid, from: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceLabel);
        GetActiveConsent(accessManagementApiClient, from.orgUuid, getActiveConsentLabel);
        GetPendingDelegationsForUser(accessManagementApiClient, from.orgUuid, GetPendingDelegationsForUserLabel);
        GetConnections(bffConnectionsApiClient, { party: from.orgUuid, from: from.orgUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabel);
        GetResourceById(accessManagementApiClient, { resourceId: resource }, getResourceByIdLabel);
        GetDelegationCheck(bffAccessPackageApiClient, { party: from.partyUuid }, getDelegationCheckLabel);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithTo);
    });

    // Delegate dialog to other user.
    // Calls every bff as the browser would do
    group(group2Label, function () {
        const resp = GetRightsMeta(accessManagementApiClient, { resource: resource }, getRightsMetaLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabel);
        DelegateRightsForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getInstanceDelegationBody(JSON.parse(resp), to), delegateRightsForResourceLabel);
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.orgUuid, from: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceAfterLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabelAfter);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithToAfter);
        GetConnections(bffConnectionsApiClient, { party: from.orgUuid, from: from.orgUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabelAfter);
    });

    // Finally, check that the delegated dialog is visible for the delegated user by
    // using the dialogporten graphql API to get the dialog by id, and to get all dialogs for party
    // and check that the dialog is there. This is to verify that the delegation is working end to end,
    // and that the delegated user can see the dialog in their list of dialogs and access it.
    group(group3Label, function () {
        tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(to.ssn));
        GetAllDialogsForPartyCheckForDialogId(graphqlClient, from.orgNo, dialogId, getAllDialogsForPartyLabel);
        GetAndVerifyDialogById(graphqlClient, dialogId, getDialogByIdLabel);
    });
}
