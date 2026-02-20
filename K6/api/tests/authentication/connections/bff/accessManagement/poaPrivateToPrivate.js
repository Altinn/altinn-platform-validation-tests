import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections } from "../../../../../building-blocks/authentication/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { getClients, getTokenOpts } from "../../common-functions.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { PostDelegations, DeleteDelegations } from "../../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, AccessPackageApiClient } from "../../../../../../clients/authentication/index.js";
import { PostRightholder } from "../../../../../building-blocks/authentication/bff-connections/index.js";

// Labels for different actions
const postRightholderLabel = "Connecting users with PostRightholder";
const getRightholdersToLabel = "Get rightholders with to parameter";
const getRightholdersWithoutToLabel = "Get rightholders without to parameter";
const tokenGeneratorLabel = "Personal Token Generator";
const accessPackageLabel = "Access Package Delegation";
const accessPackageDeleteLabel = "Access Package Delete Delegation";
const groupLabel = "Delegate accesspackage from user to user";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

// get k6 options
export const options = getOptions([postRightholderLabel, getRightholdersToLabel, getRightholdersWithoutToLabel, accessPackageLabel, accessPackageDeleteLabel, tokenGeneratorLabel], [groupLabel]);

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-fullmakt/K6/testdata/authentication/user-party-lastname-${__ENV.ENVIRONMENT}.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  const baseUrl = __ENV.ENVIRONMENT === "tt02"  ? "https://platform.tt02.altinn.no" : `https://platform.${__ENV.ENVIRONMENT}.altinn.cloud`;
  const apResp= http.get(`${baseUrl}/accessmanagement/api/v1/meta/info/accesspackages/search?typeName=person`);
  const resp = JSON.parse(apResp.body);
  const accessPackages = [];
  for (const item of resp) {
      const accessPackage = item.object.urn.split(":").pop();
      const id = item.object.id;
      if (accessPackage.includes("innbygger")) {
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

    // Get from and to users for the test iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);
    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.partyUuid} -> ${to.ssn}/${to.partyUuid} and access package: ${accessPackage.accessPackage} - ${accessPackage.id}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabel, function () {
        PostRightholder(bffConnectionsApiClient, from.partyUuid, to.ssn, to.lastName, postRightholderLabel);
        getRightHolders(connectionsApiClient, from);
        getRightHoldersWithoutTo(connectionsApiClient, from);
        PostDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageLabel); 
        DeleteDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageDeleteLabel); 
    });
}

function getRightHolders(connectionsApiClient, party) {
    const queryParamsTo = {
      party: party.partyUuid,
      from: party.partyUuid,
      to: party.partyUuid,
      includeClientDelegations: true,
      includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersToLabel
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party) {
    const queryParamsTo = {
      party: party.partyUuid,
      from: party.partyUuid,
      includeClientDelegations: true,
      includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersWithoutToLabel
    );
    return respBody;
}

function getFromTo(list) {
    if (randomize) {
        const from = getItemFromList(list, randomize);
        let to = getItemFromList(list, randomize);
        while (to.ssn === from.ssn) {
            to = getItemFromList(list, randomize);
        }
        return { from, to };
    } else {
        const from = list[__ITER % list.length];
        let to = getItemFromList(list, true);
        while (to.ssn === from.ssn) {
            to = getItemFromList(list, true);
        }
        return { from, to };
    }
    
}

