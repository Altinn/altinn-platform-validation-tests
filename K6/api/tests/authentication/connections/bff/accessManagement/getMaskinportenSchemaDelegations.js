import exec from "k6/execution";
import http from "k6/http";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { GetDelegations } from "../../../../../building-blocks/authentication/maskinporten-schema/index.js";
import { MaskinportenSchemaApiClient } from "../../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator, randomIntBetween } from "../../../../../../common-imports.js";

// Labels for different actions
const getMaskinportenSchemaLabel1 = "Get maskinportenSchema supplierOrg as query param";
const getMaskinportenSchemaLabel2 = "Get maskinportenSchema supplierOrg and consumerOrg as query params";
const getMaskinportenSchemaLabel3 = "Get maskinportenSchema supplierOrg consumerOrg and scope as query params";
const getMaskinportenSchemaLabel4 = "Get maskinportenSchema supplierOrg and scope as query params";
const getMaskinportenSchemaLabel5 = "Get maskinportenSchema consumerOrg and scope as query params";

const tokenGeneratorLabel = "Enterprise Token Generator";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

let tokenGenerator = undefined;
let maskinportenSchemaApiClient = undefined;

const scopes = [
    "altinn:consentrequests.read",
    "altinn:consentrequests.write",
    "altinn:consenttokens",
    "dev:maskinporten/testapp10.read",
    "dev:maskinporten/testapp10.write",
    "dev:maskinporten/testapp1.read",
    "dev:maskinporten/testapp1.write",
    "dev:maskinporten/testapp2.read",
    "dev:maskinporten/testapp2.write",
    "dev:maskinporten/testapp3.read",
    "dev:maskinporten/testapp3.write",
    "dev:maskinporten/testapp4.read",
    "dev:maskinporten/testapp4.write",
    "dev:maskinporten/testapp5.read",
    "dev:maskinporten/testapp5.write",
    "dev:maskinporten/testapp6.read",
    "dev:maskinporten/testapp6.write",
    "dev:maskinporten/testapp7.read",
    "dev:maskinporten/testapp7.write",
    "dev:maskinporten/testapp8.read",
    "dev:maskinporten/testapp8.write",
    "dev:maskinporten/testapp9.read",
    "dev:maskinporten/testapp9.write",
];

// get k6 options
export const options = getOptions(
    [
        getMaskinportenSchemaLabel1,
        getMaskinportenSchemaLabel2,
        getMaskinportenSchemaLabel3,
        getMaskinportenSchemaLabel4,
        getMaskinportenSchemaLabel5,
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

export default function (data) {
    const segmentedData = data;
    const maskinportenSchemaApiClient = getClients();
    const [queryParams, label] = getQueryParams(segmentedData[exec.vu.idInTest - 1]) 
    const resp = GetDelegations(maskinportenSchemaApiClient, queryParams, label);
    //const json = JSON.parse(resp);
    //console.log(`VU ${exec.vu.idInTest} - ${label} - Number of delegations received: ${json.length}`);

}

function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:maskinporten/delegations.admin");
        tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
    }
    if (maskinportenSchemaApiClient == undefined) {
        maskinportenSchemaApiClient = new MaskinportenSchemaApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return maskinportenSchemaApiClient;
}

function getQueryParams(list) {
    const queryParams = {};
    let supplierOrg = undefined;
    let label = "";
    const randomValue = randomIntBetween(0, 4);
    switch (randomValue) {
        case 0:
            queryParams.supplierOrg = getOrganization(list, randomize).orgNo;
            label = getMaskinportenSchemaLabel1;
            break;
        case 1:
            supplierOrg = getOrganization(list, randomize);
            queryParams.supplierOrg = supplierOrg.orgNo;
            queryParams.consumerOrg = getOrganization(list, true, supplierOrg).orgNo;
            label = getMaskinportenSchemaLabel2;
            break;
        case 2:
            supplierOrg = getOrganization(list, randomize);
            queryParams.supplierOrg = supplierOrg.orgNo;
            queryParams.consumerOrg = getOrganization(list, true, supplierOrg).orgNo;
            queryParams.scope = getItemFromList(scopes, true);
            label = getMaskinportenSchemaLabel3;
            break;
        case 3:
            queryParams.supplierOrg = getOrganization(list, randomize).orgNo;
            queryParams.scope = getItemFromList(scopes, true);
            label = getMaskinportenSchemaLabel4;
            break;
        case 4:
            queryParams.consumerOrg = getOrganization(list, randomize).orgNo;
            queryParams.scope = getItemFromList(scopes, true);
            label = getMaskinportenSchemaLabel5;
            break;
        default:
            queryParams.supplierOrg = getOrganization(list, randomize).orgNo;
            label = getMaskinportenSchemaLabel1;
            break;
    }
    return [queryParams, label];
}

function getOrganization(list, randomize=true, avoidItem={ ssn: "", orgNo: "" }) {
    let from = undefined;
    while (randomize && (from === undefined || (from.ssn === avoidItem.ssn && from.orgNo === avoidItem.orgNo))) {
        from = getItemFromList(list, randomize);
    }
    if (!randomize) {
        from = list[__ITER % list.length];
    } 
    return from;    
}



