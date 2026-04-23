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
import { GetDelegatedInstancesForResource, GetActiveConsent, GetResourceById, GetRightsMeta, DelegateRightsForResource } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetOrganizationData, CheckDelegationForResource, GetRoleMeta } from "../../../../building-blocks/authentication/client-delegations/index.js";
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

const partTwoLabel = { step: "2 - Get access management data for user and resource" };
const getRightsMetaLabel = { step: "2a. Get rights meta for resource" };
const checkDelegationForResourceLabel = { step: "2b. Check delegation for resource and instance for user" };
const delegateRightsForResourceLabel = { step: "2c. Delegate rights for resource and instance for user" };
const getDelegatedInstancesForResourceAfterLabel = { step: "2d. Get delegated instances for resource for user after delegation" };
const checkDelegationForResourceLabelAfter = { step: "2e. Check delegation for resource and instance for user after delegation" };
const getConnectionsWithToAfter = { step: "2f. Get connections for user with to parameterafter delegation" };
const getConnectionsLabelAfter = { step: "2g. Get connections for user after delegation" };
const getRoleMetaLabel = { step: "2h. Get role meta" };

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

    partTwoLabel,
    getRightsMetaLabel,
    checkDelegationForResourceLabel,
    delegateRightsForResourceLabel,
    getDelegatedInstancesForResourceAfterLabel,
    checkDelegationForResourceLabelAfter,
    getConnectionsWithTo,
    getConnectionsWithToAfter,
    getConnectionsLabelAfter,
    getRoleMetaLabel,

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
            from.ssn,
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
        GetIsCompanyProfileAdmin(userApiClient, { party: from.partyUuid }, getIsCompanyProfileAdminLabel);
        GetReportee(userApiClient, from.userPartyId, getReporteeLabel);
        GetProfile(userApiClient, getProfileLabel);
        GetIsAdmin(userApiClient, { party: from.partyUuid }, getIsAdminLabel);
        GetIsClientAdmin(userApiClient, { party: from.partyUuid }, getIsClientAdminLabel);
        GetActorListOld(userApiClient, getActorListOldLabel);
        GetActorListFavorites(userApiClient, getActorListFavoritesLabel);
        GetOrganizationData(accessManagementApiClient, {}, getOrganizationDataLabel);
        GetIsInstanceAdmin(userApiClient, { party: from.partyUuid }, getIsInstanceAdminLabel);
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.partyUuid, from: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceLabel);
        GetActiveConsent(accessManagementApiClient, from.partyUuid, getActiveConsentLabel);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabel);
        GetResourceById(accessManagementApiClient, { resourceId: resource }, getResourceByIdLabel);
        GetDelegationCheck(bffAccessPackageApiClient, { party: from.partyUuid }, getDelegationCheckLabel);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithTo);
    });

    // Delegate dialog to other user.
    // Calls every bff as the browser would do
    group(group2Label, function () {
        const resp = GetRightsMeta(accessManagementApiClient, { resource: resource }, getRightsMetaLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabel);
        DelegateRightsForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getInstanceDelegationBody(JSON.parse(resp), to), delegateRightsForResourceLabel);
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.partyUuid, from: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceAfterLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabelAfter);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithToAfter);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabelAfter);
        GetRoleMeta(accessManagementApiClient, {}, getRoleMetaLabel);
    });

    // Finally, check that the delegated dialog is visible for the delegated user by
    // using the dialogporten graphql API to get the dialog by id, and to get all dialogs for party
    // and check that the dialog is there. This is to verify that the delegation is working end to end,
    // and that the delegated user can see the dialog in their list of dialogs and access it.
    group(group3Label, function () {
        tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(to.ssn));
        GetAllDialogsForPartyCheckForDialogId(graphqlClient, from.ssn, dialogId, getAllDialogsForPartyLabel);
        GetAndVerifyDialogById(graphqlClient, dialogId, getDialogByIdLabel);
    });
}
