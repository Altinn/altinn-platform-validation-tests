import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { getTokenOpts } from "../../common-functions.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { ConnectionsApiClient, ClientDelegationsApiClient, AccessPackageApiClient } from "../../../../../../clients/authentication/index.js";
import { GetAgents, GetClients } from "../../../../../building-blocks/authentication/client-delegations/index.js";
import { GetDelegationCheck } from "../../../../../building-blocks/authentication/access-package/delegate.js";
import { GetConnections } from "../../../../../building-blocks/authentication/connections/index.js";
import { PersonalTokenGenerator } from "../../../../../../common-imports.js";


// Labels for different actions
const tokenGeneratorLabel = "Personal Token Generator";
const groupLabel = "Open client administration";

const getConnectionsLabel = "Get connections/rightholders";
const getClientsLabel = "Get clients";
const getAgentsLabel = "Get agents";
const getDelegationCheckLabel = "Get delegation check";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

let tokenGenerator = undefined;
let clientDelegationsApiClient = undefined;
let connectionsApiClient = undefined;
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([getConnectionsLabel, getAgentsLabel, getClientsLabel, getDelegationCheckLabel, tokenGeneratorLabel], [groupLabel]);

/**
 * Setup function to segment data for VUs.
 */
///Users/dagfinnolsen/dev/altinn-platform-validation-tests/K6/testdata/authentication/orgs-in-yt01-with-party-uuid.csv
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-fullmakt/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  return segmentedData;
}

function getClients(bff=false) {
  if (tokenGenerator == undefined) {
      const tokenOpts = new Map();
      tokenOpts.set("env", __ENV.ENVIRONMENT);
      tokenOpts.set("ttl", 3600);
      tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
      tokenGenerator = new PersonalTokenGenerator(tokenOpts);
  }
  if (clientDelegationsApiClient == undefined) {
      clientDelegationsApiClient = new ClientDelegationsApiClient(__ENV.BASE_URL, tokenGenerator, bff);
  }
  if (connectionsApiClient == undefined) {
      connectionsApiClient = new ConnectionsApiClient(__ENV.BASE_URL, tokenGenerator, bff);
  }
  if (accessPackageApiClient == undefined) {
      accessPackageApiClient = new AccessPackageApiClient(__ENV.BASE_URL, tokenGenerator, bff);
  }
  return [connectionsApiClient, clientDelegationsApiClient, accessPackageApiClient, tokenGenerator];
}


/**
 * Main function executed by each VU.
 */
export default function (testData) {

    // connectionsApiClient for bff
    const bff = true;
    const [connectionsApiClient, clientDelegationsApiClient, accessPackageApiClient, tokenGenerator] = getClients(bff);

    const testObject = getItemFromList(testData[exec.vu.idInTest - 1], randomize);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(testObject.userId, testObject.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabel, function () {
        const connectionsQueryParams = {
            party: testObject.partyUuid,
            from: testObject.orgUuid,
            to: testObject.partyUuid,
            includeClientDelegations: true,
            includeAgentConnections: true
        };
        GetConnections(connectionsApiClient, connectionsQueryParams, getConnectionsLabel);
        const queryParams = {
            party: testObject.orgUuid,
        };
        GetAgents(clientDelegationsApiClient, queryParams, getAgentsLabel);
        GetClients(clientDelegationsApiClient, queryParams, getClientsLabel);
        GetDelegationCheck(accessPackageApiClient, queryParams, getDelegationCheckLabel);

        
    });
}

