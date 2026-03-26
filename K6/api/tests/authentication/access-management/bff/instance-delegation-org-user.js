import http from "k6/http";
import exec from "k6/execution";
import { group } from "k6";
import { EnterpriseTokenGenerator, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { CreateDialog } from "../../../../building-blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../../clients/dialogporten/serviceowner/index.js";
import { GraphqlClient } from "../../../../../clients/dialogporten/graphql/index.js";
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
import { BffUserApiClient, BffAccessManagementApiClient, BffConnectionsApiClient, BffAccessPackageApiClient } from "../../../../../clients/authentication/index.js";
import { GetOrganizationData, CheckDelegationForResource, GetRoleMeta, GetPendingDelegationsForUser } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetConnections } from "../../../../building-blocks/authentication/connections/index.js";
import { GetDelegationCheck } from "../../../../building-blocks/authentication/access-package/index.js";
import { getItemFromList, parseCsvData, segmentData, getNumberOfVUs, getOptions } from "../../../../../helpers.js";
import { getTokenOpts } from "./commons.js";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

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

// All apiclient used in this test
let serviceOwnerApiClient = undefined;
let userApiClient = undefined;
let accessManagementApiClient = undefined;
let bffConnectionsApiClient = undefined;
let bffAccessPackageApiClient = undefined;
let graphqlClient = undefined;

// personal tokengenerator.
let personalTokenGenerator = undefined;

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
const getRoleMetaLabel = "2h. Get role meta";

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
    getRoleMetaLabel,

    partThreeLabel,
    getDialogByIdLabel,
    getAllDialogsForPartyLabel,
], [group0Label, group1Label, group2Label, group3Label]
);

/**
* Function to set up and return clients to interact with the Service Owner Dialog API
*
* @returns {Array} An array containing the AuthorizedPartiesClient instance
*/
export function getClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider");
        tokenOpts.set("org", "ttd");
        tokenOpts.set("orgNo", serviceOwnerOrgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (userApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        userApiClient = new BffUserApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        accessManagementApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffConnectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffAccessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        graphqlClient = new GraphqlClient(__ENV.BASE_URL, personalTokenGenerator);
    }
    return [serviceOwnerApiClient, userApiClient, accessManagementApiClient, bffConnectionsApiClient, bffAccessPackageApiClient, graphqlClient, personalTokenGenerator];
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-instance-delegation/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
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
 */
export default function (data) {
    const [serviceOwnerApiClient, userApiClient, accessManagementApiClient, bffConnectionsApiClient, bffAccessPackageApiClient, graphqlClient, tokenGenerator] = getClients();
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    console.log(`VU: ${exec.vu.idInTest} - from: ${from.ssn} (${from.orgNo}) to: ${to.ssn}`);
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
        console.log(`Dialog created with id: ${dialogId}`);
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // Open access management after creating the dialog.
    // Call every bff endpoint that the browser uses when navigating from arbeidsflate/del og gi tilgang
    group(group1Label, function () {
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/lookup/party/user
        GetLookupPartyUser(userApiClient, getLookupPartyUserLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isCompanyProfileAdmin?party=f1399084-2814-4f54-ab0e-75a931628762
        GetIsCompanyProfileAdmin(userApiClient, { party: from.orgUuid }, getIsCompanyProfileAdminLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/reportee/51267137
        GetReportee(userApiClient, from.partyId, getReporteeLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/profile
        GetProfile(userApiClient, getProfileLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isAdmin?party=f1399084-2814-4f54-ab0e-75a931628762
        GetIsAdmin(userApiClient, { party: from.orgUuid }, getIsAdminLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isClientAdmin?party=f1399084-2814-4f54-ab0e-75a931628762
        GetIsClientAdmin(userApiClient, { party: from.orgUuid }, getIsClientAdminLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/old
        GetActorListOld(userApiClient, getActorListOldLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/favorites
        GetActorListFavorites(userApiClient, getActorListFavoritesLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/permissions?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=f1399084-2814-4f54-ab0e-75a931628762&to=5f453a8c-86e2-4bef-bbd9-6235edf414f0
        GetRolePermissions(accessManagementApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid }, getRolePermissionsLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/cdn/orgdata
        GetOrganizationData(accessManagementApiClient, {}, getOrganizationDataLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isInstanceAdmin?party=f1399084-2814-4f54-ab0e-75a931628762
        GetIsInstanceAdmin(userApiClient, { party: from.orgUuid }, getIsInstanceAdminLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=f1399084-2814-4f54-ab0e-75a931628762&from=f1399084-2814-4f54-ab0e-75a931628762&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d24e3-4c4b-72d7-97ba-eb55c92c4263
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.partyUuid, from: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/consent/active/f1399084-2814-4f54-ab0e-75a931628762
        GetActiveConsent(accessManagementApiClient, from.orgUuid, getActiveConsentLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/systemuser/f1399084-2814-4f54-ab0e-75a931628762/pending
        GetPendingDelegationsForUser(accessManagementApiClient, from.orgUuid, GetPendingDelegationsForUserLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=f1399084-2814-4f54-ab0e-75a931628762&from=f1399084-2814-4f54-ab0e-75a931628762&to=&includeClientDelegations=true&includeAgentConnections=true
        GetConnections(bffConnectionsApiClient, { party: from.orgUuid, from: from.orgUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/resources?resourceId=k6-instancedelegation-test
        GetResourceById(accessManagementApiClient, { resourceId: resource }, getResourceByIdLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/accesspackage/delegationcheck?party=f1399084-2814-4f54-ab0e-75a931628762
        GetDelegationCheck(bffAccessPackageApiClient, { party: from.partyUuid }, getDelegationCheckLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=f1399084-2814-4f54-ab0e-75a931628762&to=5f453a8c-86e2-4bef-bbd9-6235edf414f0&includeClientDelegations=true&includeAgentConnections=true
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithTo);



    });

    // // Delegate dialog to other user.
    // // Calls every bff as the browser would do
    group(group2Label, function () {
        const resp = GetRightsMeta(accessManagementApiClient, { resource: resource }, getRightsMetaLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances/rights?party=f1399084-2814-4f54-ab0e-75a931628762&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d24e3-4c4b-72d7-97ba-eb55c92c4263
        DelegateRightsForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getInstanceDelegationBody(JSON.parse(resp), to), delegateRightsForResourceLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=f1399084-2814-4f54-ab0e-75a931628762&from=f1399084-2814-4f54-ab0e-75a931628762&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d24e3-4c4b-72d7-97ba-eb55c92c4263
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.orgUuid, from: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceAfterLabel);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegationcheck?party=f1399084-2814-4f54-ab0e-75a931628762&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d24e3-4c4b-72d7-97ba-eb55c92c4263
        CheckDelegationForResource(accessManagementApiClient, { party: from.orgUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabelAfter);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=f1399084-2814-4f54-ab0e-75a931628762&to=5f453a8c-86e2-4bef-bbd9-6235edf414f0&includeClientDelegations=true&includeAgentConnections=true
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.orgUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithToAfter);
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=f1399084-2814-4f54-ab0e-75a931628762&from=f1399084-2814-4f54-ab0e-75a931628762&to=&includeClientDelegations=true&includeAgentConnections=true
        GetConnections(bffConnectionsApiClient, { party: from.orgUuid, from: from.orgUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabelAfter);
        //     GetRoleMeta(accessManagementApiClient, {}, getRoleMetaLabel);
    });

    group(group3Label, function () {
        tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(to.ssn));
        GetAllDialogsForPartyCheckForDialogId(graphqlClient, from.orgNo, dialogId, getAllDialogsForPartyLabel);
        GetAndVerifyDialogById(graphqlClient, dialogId, getDialogByIdLabel);
    });
}

function getDialogportenOpts(ssn) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten");
    tokenOpts.set("pid", ssn);
    return tokenOpts;
}

/**
 * Helper function to create the body for delegating rights for a resource and instance to another user, 
 * based on the rights meta for the resource and the "to" user.
 * @param { JSON } rightsMeta 
 * @param {*} to 
 * @returns 
 */
function getInstanceDelegationBody(rightsMeta, to) {
    return {
        to: {
            personIdentifier: to.ssn,
            lastName: to.lastName,
        },
        directRightKeys: rightsMeta.map((right) => right.key),
    };
}

/**
 * Helper function to get from and to organizations/users for the current iteration, ensuring that they are not the same
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
    console.log(`Selected from: ${from.ssn} and to: ${to.ssn}`);
    return { from, to };
}
