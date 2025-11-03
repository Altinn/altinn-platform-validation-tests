import { SharedArray } from 'k6/data';
import { ConnectionsApiClient } from "../../../../clients/auth/index.js"
import { PersonalTokenGenerator } from '../../../../commonImports.js';
import { segmentData, getNumberOfVUs } from '../../../../helpers.js';
import { readCsv } from '../../../../helpers.js';

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsIn-${__ENV.ENVIRONMENT}-WithPartyUuid.csv`);
const parties = new SharedArray('parties', function () {
  return readCsv(partiesFilename);
});

let connectionsApiClient = undefined;
let tokenGenerator = undefined;

/**
 * Function to set up and return clients to interact with the Pdp Authorize API
 *
 * @returns {Array} An array containing the PdpAuthorizeClient and PersonalTokenGenerator instances
 */
export function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, tokenGenerator];
}

/**
 * Function to get token options map.
 * @param {string} ssn - social security number
 * @returns map of token options
 */
export function getTokenOpts(userId) {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);
  tokenOpts.set("scopes", "altinn:portal/enduser");
  tokenOpts.set("userId", userId);
  return tokenOpts;
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const segmentedData = segmentData(parties, numberOfVUs);
  return segmentedData;
}