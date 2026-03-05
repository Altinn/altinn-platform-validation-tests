import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections, PostRightholder } from "../../../../building-blocks/authentication/connections/index.js";
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
    DeleteRightholderConnection,
} from "../../../../building-blocks/authentication/client-delegations/index.js";
import { parseCsvData, segmentData, getNumberOfVUs, getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetDelegations } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, BffAccessPackageApiClient, BffAccessManagementApiClient, BffSingleRightApiClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getTokenOpts } from "./commons.js";

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
const getDelegationCheckLabel = "2b. Get delegation check for client delegation";
const postDelegationLabel = "2c. Delegate serviceresource from org to org";
const getDelegatedResourcesLabel2d = "2d. Get delegated resources for client delegation";
const getDelegationCheckLabel2e = "2e. Get delegation check for client delegation after delegating";
const getDelegatedRightsForResourceLabel2f = "2f. Get delegated rights for resource for client delegation";

const revokeSingleRightLabel = "3a. Revoke single right for client delegation";
const getDelegatedResourcesLabel3b = "3b. Get delegated resources for client delegation after revoking single right";
const getDelegationCheckLabel3c = "3c. Get delegation check for client delegation after revoking single right";
const getRolePermissionsLabel3d = "3d. Get role permissions for org to org";
const deleteRightholderConnectionLabel = "3f. Delete rightholder connection between orgs";

const fullmaktGroup = "1. Delegate accesspackage from organization to organization";
const clientDelegationGroup = "3. Client delegation from organization to user";
const cleanupGroup = "4. Cleanup - delete delegation";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// get k6 options
export const options = getOptions(
    [
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

        searchAccessPackagesLabel2a,
        getDelegationCheckLabel,
        postDelegationLabel,
        getDelegatedResourcesLabel2d,
        getDelegationCheckLabel2e,
        getDelegatedRightsForResourceLabel2f,

        revokeSingleRightLabel,
        getDelegatedResourcesLabel3b,
        getDelegationCheckLabel3c,
        getRolePermissionsLabel3d,

        deleteRightholderConnectionLabel,
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
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/fullmakt-enkelttjenester/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}


/**
 * Main function executed by each VU.
 */
export default function (segmentedData) {
    // testdata. [0] contains segmented user data for each VU, [1] contains access packages
    const [connectionsApiClient, accessPackageApiClient, singleRightsApiClient, userApiClient, tokenGenerator] = getClients();

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);

    console.log(`VU ${exec.vu.idInTest} - From org: ${from.orgNo}/${from.ssn}), To org: ${to.orgNo}/${to.ssn}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    group(fullmaktGroup, function () {
        //https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/reportee/f1399084-2814-4f54-ab0e-75a931628762/rightholder?rightholderPartyUuid=223c8f0e-3887-4dba-8e2b-45ace76decfd
        PostRightholder(connectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        let queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        }
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1a);
        queryParams = {
            party: from.partyUuid,
            from: from.orgUuid,
            to: from.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        }
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1c);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: false,
        }
        GetConnections(connectionsApiClient, queryParams, getRightholdersLabel1d);
        queryParams = {
            party: from.orgUuid,
            from: from.orgUuid,
            to: to.orgUuid,
            includeClientDelegations: true,
            includeAgentConnections: true,
        }
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


    group(clientDelegationGroup, function () {
        SearchAccessPackages(userApiClient, { searchString: "testre", typeName: "organisasjon" }, searchAccessPackagesLabel2a);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, getDelegationCheckLabel);
        PostSingleRight(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, "testressurs-tilgangspakke-org-damp-varmtvann-1", postDelegationLabel);
        GetDelegatedResources(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel2d);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, getDelegationCheckLabel2e);
        GetDelegatedRightsForResource(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, getDelegatedRightsForResourceLabel2f);
    });

    group(cleanupGroup, function () {
        RevokeSingleRight(singleRightsApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid, resourceId: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, revokeSingleRightLabel);
        GetDelegatedResources(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid }, getDelegatedResourcesLabel3b);
        GetDelegationCheck(singleRightsApiClient, { from: from.orgUuid, resource: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, getDelegationCheckLabel3c);
        GetDelegatedRightsForResource(userApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, resourceId: "testressurs-tilgangspakke-org-damp-varmtvann-1" }, getRolePermissionsLabel);

        GetRolePermissions(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, getRolePermissionsLabel3d);


        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/permissions?party=4f08f455-5005-4c12-9ed2-f1d66f016af7&from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=4f08f455-5005-4c12-9ed2-f1d66f016af7
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/permissions?party=0d8e92cb-febc-46df-bf38-0540a084bfb1&from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/meta
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/accesspackage/delegations?from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762&party=0d8e92cb-febc-46df-bf38-0540a084bfb1
        DeleteRightholderConnection(userApiClient, { party: from.orgUuid, from: from.orgUuid, to: to.orgUuid }, deleteRightholderConnectionLabel);
        // Del https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/reportee?party=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762&from=0d8e92cb-febc-46df-bf38-0540a084bfb1
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/permissions?party=0d8e92cb-febc-46df-bf38-0540a084bfb1&from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/permissions?party=4f08f455-5005-4c12-9ed2-f1d66f016af7&from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=4f08f455-5005-4c12-9ed2-f1d66f016af7
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/role/meta
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/accesspackage/delegations?from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762&party=0d8e92cb-febc-46df-bf38-0540a084bfb1
        // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=0d8e92cb-febc-46df-bf38-0540a084bfb1&from=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=&includeClientDelegations=true&includeAgentConnections=false

    });

}

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

