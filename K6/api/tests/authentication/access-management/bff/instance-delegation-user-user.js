import http from "k6/http";
import exec from "k6/execution";
import { group } from "k6";
import { EnterpriseTokenGenerator, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { CreateDialog } from "../../../../building-blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../../clients/dialogporten/serviceowner/index.js";
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
import { BffUserApiClient, BffAccessManagementApiClient, BffConnectionsApiClient, BffAccessPackageApiClient } from "../../../../../clients/authentication/index.js";
import { GetOrganizationData, CheckDelegationForResource, GetRoleMeta } from "../../../../building-blocks/authentication/client-delegations/index.js";
import { GetConnections } from "../../../../building-blocks/authentication/connections/index.js";
import { GetDelegationCheck } from "../../../../building-blocks/authentication/access-package/index.js";
import { getItemFromList, parseCsvData, segmentData, getNumberOfVUs, getOptions } from "../../../../../helpers.js";
import { getTokenOpts } from "./commons.js";

const resources = [
    //"testressurs-tilgangspakke-innbygger-loyve-1"
    "k6-instancedelegation-test",
    //"ttd-dialogporten-performance-test-01",
    // "k6-test-innbygger-stotte-tilskudd",
    // "k6-test-innbygger-avlastning-stotte",
    // "k6-test-innbygger-design-varemerke",
    // "k6-test-innbygger-kultur",
    // "k6-test-innbygger-pleie-omsorg"
];

let serviceOwnerOrgNo = "991825827";
if (__ENV.ENVIRONMENT === "yt01") {
    serviceOwnerOrgNo = "713431400";
}
let serviceOwnerApiClient = undefined;
let userApiClient = undefined;
let accessManagementApiClient = undefined;
let bffConnectionsApiClient = undefined;
let bffAccessPackageApiClient = undefined;
let personalTokenGenerator = undefined;

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

const partTwoLabel = "2 - Get access management data for user and resource";
const getRightsMetaLabel = "2a. Get rights meta for resource";
const checkDelegationForResourceLabel = "2b. Check delegation for resource and instance for user";
const delegateRightsForResourceLabel = "2c. Delegate rights for resource and instance for user";
const getDelegatedInstancesForResourceAfterLabel = "2d. Get delegated instances for resource for user after delegation";
const checkDelegationForResourceLabelAfter = "2e. Check delegation for resource and instance for user after delegation";
const getConnectionsWithToAfter = "2f. Get connections for user with to parameterafter delegation";
const getConnectionsLabelAfter = "2g. Get connections for user after delegation";
const getRoleMetaLabel = "2h. Get role meta";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

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
]);

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
    }
    return [serviceOwnerApiClient, userApiClient, accessManagementApiClient, bffConnectionsApiClient, bffAccessPackageApiClient, personalTokenGenerator];
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

export default function (data) {
    const [serviceOwnerApiClient, userApiClient, accessManagementApiClient, bffConnectionsApiClient, bffAccessPackageApiClient, tokenGenerator] = getClients();
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources);
    console.log(`Creating dialog for ssn: ${from.ssn} and resource: ${resource}`);
    let dialogId = null;

    group(`VU ${exec.vu.idInTest} - Create dialog for instance delegation`, function () {
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
        console.log(`Dialog created with id: ${dialogId}`);
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
    group('Open access management', function () {
        GetLookupPartyUser(userApiClient, getLookupPartyUserLabel);
        GetIsCompanyProfileAdmin(userApiClient, { party: from.partyUuid }, getIsCompanyProfileAdminLabel);
        GetReportee(userApiClient, "50508927", getReporteeLabel);
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
    group('Delegate rights for resource and instance', function () {
        const resp = GetRightsMeta(accessManagementApiClient, { resource: resource }, getRightsMetaLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabel);
        DelegateRightsForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getInstanceDelegationBody(JSON.parse(resp), to), delegateRightsForResourceLabel);
        GetDelegatedInstancesForResource(accessManagementApiClient, { party: from.partyUuid, from: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, getDelegatedInstancesForResourceAfterLabel);
        CheckDelegationForResource(accessManagementApiClient, { party: from.partyUuid, resource: resource, instance: `urn:altinn:dialog-id:${dialogId}` }, checkDelegationForResourceLabelAfter);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, to: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsWithToAfter);
        GetConnections(bffConnectionsApiClient, { party: from.partyUuid, from: from.partyUuid, includeClientDelegations: true, includeAgentConnections: true }, getConnectionsLabelAfter);
        GetRoleMeta(accessManagementApiClient, {}, getRoleMetaLabel);
    });

    // åpne tilgangsstyring
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/sent?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/received?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)


    // Ny bruker

    // Legg til bruker
    // POST: https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances/rights?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    // {"to":{"personIdentifier":"27820698741","lastName":"lørdag"},"directRightKeys":["018e9eb719996e0a45054bf68a3fa14aebcfad4ec944194b08149a1d9eb5b5ec7f","010c7c883aa8fa5ce7824aa263a4c01be0bac14104e7eb3c4e72b8dca45d54b188","01c93af1e19e132972aa7b87cbf04a19fd9d66cd5e6ff10b61079fd3665396a536","01a7d7336a2b8929d61e352c05d2efb015309b231a6001952d2099c7e0ae775031"]}
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegationcheck?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=5f453a8c-86e2-4bef-bbd9-6235edf414f0&includeClientDelegations=true&includeAgentConnections=true
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&includeClientDelegations=true&includeAgentConnections=true
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/meta        





}

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
