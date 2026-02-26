import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { PostOffered } from "../../../../../building-blocks/authentication/maskinporten-schema/post-offered.js";
import { MaskinportenSchemaApiClient } from "../../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../../../common-imports.js";

// Labels for different actions
const postMaskinportenSchemaLabel = "1a. Post maskinportenSchema to org";

const resources = [
    "digdir-maskinportenschemaid-39",
    "skd-maskinportenschemaid-100",
    "skd-maskinportenschemaid-95",
    "skd-maskinportenschemaid-96",
    "skd-maskinportenschemaid-97",
    "skd-maskinportenschemaid-98",
    "skd-maskinportenschemaid-99",
    "skd-maskinportenschemaid-92",
    "skd-maskinportenschemaid-93",
    "skd-maskinportenschemaid-94",
    "digdir-maskinportenschemaid-1103",
];

let tokenGenerator = undefined;
let maskinportenSchemaApiClient = undefined;

const tokenGeneratorLabel = "Personal Token Generator";


const fullmaktGroup = "1. Delegate maskinportenSchema from organization to organization";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

// get k6 options
export const options = getOptions(
    [
        postMaskinportenSchemaLabel,
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
  
  return segmentedData;
}


/**
 * Main function executed by each VU.
 */

export default function (testData) {
    // testdata. [0] contains segmented user data for each VU, [1] contains access packages
    const segmentedData = testData;
    //const to = segmentedData[6][15];
    // {
    //     ssn: "11111574113",
    //     orgUuid: "859a5136-ddc8-4f07-9dec-a6312e2907cf",
    //     orgNo: "708202592",
    //     210223002
    //     210360492
    //     210486372
    //     310475327
    //     312533944
    //     700088987
    //     624546814
    //     498665381
    //     314257634
    //   }

    //212489182,61708170,31850148921,4570356,61767043,588058e8-f997-417d-9a9a-9c40ce928994,regnskapsforer,98e20bbd-5282-45f6-85f5-3ce9f73f0ee7,KOKKEKNIV

    // connectionsApiClient for bff
    const [ maskinportenSchemaApiClient, tokenGenerator ] = getClients();

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    //const from = getFrom(segmentedData[exec.vu.idInTest - 1], to);
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources, true);
    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.orgUuid}/${from.orgNo} -> ${to.ssn}/${to.orgUuid}/${to.orgNo} and resource ${resource}`);
    //console.log(`VU ${exec.vu.idInTest} - Agent for testing client delegation: ${user.ssn}/${user.partyUuid}/${user.orgNo}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.partyUuid, from.userId, from.ssn));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(fullmaktGroup, function () {
        PostOffered(maskinportenSchemaApiClient, from.partyId, to.orgNo, resource, postMaskinportenSchemaLabel);
    });  

}

function getFrom(list, avoidItem) {
    let from = undefined;
    while (randomize && (from === undefined || from.ssn === avoidItem.ssn)) {
        from = getItemFromList(list, randomize);
    }
    if (!randomize) {
        from = list[__ITER % list.length];
    } 
    return from;    
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

function getClients() {
  if (tokenGenerator == undefined) {
      const tokenOpts = new Map();
      tokenOpts.set("env", __ENV.ENVIRONMENT);
      tokenOpts.set("ttl", 3600);
      tokenOpts.set("scopes", "altinn:instances:read");
      tokenGenerator = new PersonalTokenGenerator(tokenOpts);
  }
  if (maskinportenSchemaApiClient == undefined) {
      maskinportenSchemaApiClient = new MaskinportenSchemaApiClient(__ENV.BASE_URL, tokenGenerator);
  }
  return [maskinportenSchemaApiClient, tokenGenerator];
}

/**
* Function to get token options map.
* @param {string} ssn - social security number
* @returns map of token options
*/
function getTokenOpts(partyUuid, userid, pid,  partyuuid=null) {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);
  tokenOpts.set("scopes", "altinn:portal/enduser");
  tokenOpts.set("userId", userid);
  tokenOpts.set("partyuuid", partyUuid);  
  tokenOpts.set("pid", pid);
  return tokenOpts;
}

