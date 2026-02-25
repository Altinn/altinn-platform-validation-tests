import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { getClients, getTokenOpts } from "../../common-functions.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { PostDelegations, DeleteDelegations, GetPermission } from "../../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, AccessPackageApiClient, ClientDelegationsApiClient } from "../../../../../../clients/authentication/index.js";
import { PostRightholder } from "../../../../../building-blocks/authentication/bff-connections/index.js";

// Labels for different actions
const postRightholderLabel = "1d. Connecting organizations with PostRightholder";
const postDelegationLabel = "1g. Delegate access package from org to org";



const tokenGeneratorLabel = "Personal Token Generator";


const fullmaktGroup = "1. Delegate accesspackage from organization to organization";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

// get k6 options
export const options = getOptions(
    [
        postRightholderLabel,
        postDelegationLabel,
        tokenGeneratorLabel,
    ], 
    []
  );

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-fullmakt/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
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

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    const { from, to, user } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);
    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.orgUuid}/${from.orgNo} -> ${to.ssn}/${to.orgUuid}/${to.orgNo} and access package: ${accessPackage.accessPackage} - ${accessPackage.id}`);
    //console.log(`VU ${exec.vu.idInTest} - Agent for testing client delegation: ${user.ssn}/${user.partyUuid}/${user.orgNo}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(fullmaktGroup, function () {
        PostRightholder(bffConnectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        PostDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, packageId: accessPackage.id }, postDelegationLabel); 
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
    let user = getItemFromList(list, true);
    while (user.ssn === from.ssn || user.ssn === to.ssn) {
        user = getItemFromList(list, true);
    }
    return { from, to, user };
    
}

