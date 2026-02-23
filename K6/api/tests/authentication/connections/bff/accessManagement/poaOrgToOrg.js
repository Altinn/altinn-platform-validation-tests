import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections } from "../../../../../building-blocks/authentication/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { getClients, getTokenOpts } from "../../common-functions.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { PostDelegations, DeleteDelegations, GetPermission } from "../../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, AccessPackageApiClient, ClientDelegationsApiClient } from "../../../../../../clients/authentication/index.js";
import { PostRightholder } from "../../../../../building-blocks/authentication/bff-connections/index.js";
import { GetAgents, PostAgents, GetAccessPackages, GetClients, PostAccessPackages, DeleteAccessPackages, DeleteAgents } from "../../../../../building-blocks/authentication/client-delegations/index.js";

// Labels for different actions
const getPermissionsLabel = "1a. Get permissions";
const getRightholdersWithoutToLabel1b = "1b. Get rightholders without to parameter";
const postRightholderLabel = "1d. Connecting organizations with PostRightholder";
const getRightholdersToLabel1e = "1e. Get rightholders with to parameter";
const getRightholdersWithoutToLabel1f = "1f. Get rightholders without to parameter";
const postDelegationLabel = "1g. Delegate access package from org to org";

const postAgentsLabel = "2a. Add agent to organization";
const getAgentsLabel = "2b. Get agents for organization";
const getAccessPackagesLabel = "2c. Get access packages for agent delegation";
const getClientsLabel = "2d. Get clients for organization";
const getRightholdersToLabel2e = "2e. Get rightholders with to parameter after adding agent delegation";

const getRightholdersToLabel3a = "3a. Get rightholders with to parameter for client delegation";
const postAccessPackageLabel = "3b. Delegate access package to user for client delegation";
const getAccessPackagesLabel3c = "3c. Get access packages for client delegation";

const deleteClientDelegationLabel = "4a. Delete access package delegation from org to org";
const deleteAgentsLabel = "4b. Delete agent delegation";
const deleteAccessPackageLabel = "4c. Delete access package for client delegation";

const tokenGeneratorLabel = "Personal Token Generator";


const fullmaktGroup = "1. Delegate accesspackage from organization to organization";
const addUserGroup = "2. Add user as rightholder to organization";
const clientDelegationGroup = "3. Client delegation from organization to user";
const cleanupGroup = "4. Cleanup - delete delegation";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

// get k6 options
export const options = getOptions(
    [
        getPermissionsLabel,
        getRightholdersWithoutToLabel1b,
        postRightholderLabel,
        getRightholdersToLabel1e,
        getRightholdersWithoutToLabel1f,
        postDelegationLabel,
        postAgentsLabel,
        getAgentsLabel,
        getAccessPackagesLabel,
        getClientsLabel,
        getRightholdersToLabel2e,
        tokenGeneratorLabel,
        getRightholdersToLabel3a,
        postAccessPackageLabel,
        getAccessPackagesLabel3c,
        deleteClientDelegationLabel,
        deleteAgentsLabel,
        deleteAccessPackageLabel
    ], 
    []
  );

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-fullmakt/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-mange-avgivere.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  const baseUrl = __ENV.ENVIRONMENT === "tt02"  ? "https://platform.tt02.altinn.no" : `https://platform.${__ENV.ENVIRONMENT}.altinn.cloud`;
  const apResp= http.get(`${baseUrl}/accessmanagement/api/v1/meta/info/accesspackages/search?typeName=organization`);
  const resp = JSON.parse(apResp.body);
  const accessPackages = [];
  for (const item of resp) {
      const accessPackage = item.object.urn.split(":").pop();
      const id = item.object.id;
      const isAssignable = item.object.isAssignable;
      const isDelegable = item.object.isDelegable;
      if (isAssignable && isDelegable && !accessPackage.includes("konkursbo")) {
          accessPackages.push({ id, accessPackage });
      }
  }
  return [segmentedData, accessPackages];
}


/**
 * Main function executed by each VU.
 */
export default function (testData) {
    // testdata. [0] contains segmented user data for each VU, [1] contains access packages
    const segmentedData = testData[0];
    const accessPackages = testData[1];

    // connectionsApiClient for bff
    const bff = true;
    const [connectionsApiClient, tokenGenerator] = getClients(bff);

    // clients for access package and bff connections
    const bffConnectionsApiClient = new BffConnectionsApiClient(__ENV.BASE_URL, tokenGenerator);
    const accessPackageApiClient = new AccessPackageApiClient(__ENV.BASE_URL, tokenGenerator, bff);
    const clientDelegationsApiClient = new ClientDelegationsApiClient(__ENV.BASE_URL, tokenGenerator, bff);

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    const { from, to, user } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);
    //console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.orgUuid}/${from.orgNo} -> ${to.ssn}/${to.orgUuid}/${to.orgNo} and access package: ${accessPackage.accessPackage} - ${accessPackage.id}`);
    //console.log(`VU ${exec.vu.idInTest} - Agent for testing client delegation: ${user.ssn}/${user.partyUuid}/${user.orgNo}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(fullmaktGroup, function () {
        GetPermission(accessPackageApiClient, accessPackage.id,  { from: from.orgUuid, party: from.orgUuid }, getPermissionsLabel);
        getRightHoldersWithoutTo(connectionsApiClient, from, getRightholdersWithoutToLabel1b);
        //`https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/lookup/org/${from.orgNo}`
        PostRightholder(bffConnectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        getRightHolders(connectionsApiClient, from, to, getRightholdersToLabel1e);
        getRightHoldersWithoutTo(connectionsApiClient, from, getRightholdersWithoutToLabel1f);
        PostDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, packageId: accessPackage.id }, postDelegationLabel); 
    });

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(to.userId, to.partyUuid));

    group(addUserGroup, function () {
        PostAgents(clientDelegationsApiClient, { party: to.orgUuid }, user.ssn, user.lastName, postAgentsLabel);
        GetAgents(clientDelegationsApiClient, { party: to.orgUuid }, getAgentsLabel);
        GetAccessPackages(clientDelegationsApiClient, { party: to.orgUuid, to: user.partyUuid }, getAccessPackagesLabel);
        GetClients(clientDelegationsApiClient, { party: to.orgUuid }, getClientsLabel);
        getRightHolders(connectionsApiClient, to, user, getRightholdersToLabel2e);
    });

     group(clientDelegationGroup, function () {
        GetConnections(connectionsApiClient, { party: to.orgUuid, from: from.orgUuid, to: to.orgUuid, includeClientDelegations: true, includeAgentConnections: true }, getRightholdersToLabel3a);
        PostAccessPackages(clientDelegationsApiClient, { party: to.orgUuid, from: from.orgUuid, to: user.partyUuid }, accessPackage.accessPackage, postAccessPackageLabel);
        GetAccessPackages(clientDelegationsApiClient, { party: to.orgUuid, from: from.orgUuid }, getAccessPackagesLabel3c);
    });

    group(cleanupGroup, function () {
        DeleteAccessPackages(clientDelegationsApiClient, { party: to.orgUuid, from: from.orgUuid, to: user.partyUuid }, accessPackage.accessPackage, deleteClientDelegationLabel);
        DeleteAgents(clientDelegationsApiClient, { party: to.orgUuid, to: user.partyUuid },  deleteAgentsLabel);
        tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));
        DeleteDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, packageId: accessPackage.id }, deleteAccessPackageLabel); 
    });

}

function getRightHolders(connectionsApiClient, from, to, label) {
    const queryParamsTo = {
      party: from.orgUuid,
      from: from.orgUuid,
      to: to.partyUuid,
      includeClientDelegations: true,
      includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        label
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party, label) {
    const queryParamsTo = {
      party: party.orgUuid,
      from: party.orgUuid,
      includeClientDelegations: true,
      includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        label,
    );
    return respBody;
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
    let user = getItemFromList(list, true);
    while (user.ssn === from.ssn || user.ssn === to.ssn) {
        user = getItemFromList(list, true);
    }
    return { from, to, user };
    
}

