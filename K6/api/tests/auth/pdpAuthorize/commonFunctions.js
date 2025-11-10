import { SharedArray } from 'k6/data';
import { PdpAuthorizeClient } from "../../../../clients/auth/index.js"
import { PersonalTokenGenerator, randomIntBetween } from '../../../../commonImports.js';
import { segmentData, readCsv, getNumberOfVUs } from '../../../../helpers.js';


let pdpAuthorizeClient = undefined;
let tokenGenerator = undefined;

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
const parties = new SharedArray('parties', function () {
  return readCsv(partiesFilename);
});

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
    if (pdpAuthorizeClient == undefined) {
        pdpAuthorizeClient = new PdpAuthorizeClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [pdpAuthorizeClient, tokenGenerator];
}

/**
 * Function to get k6 options based on labels.
 * @param {} labels
 * @returns
 */
export function getOptions(labels) {
  const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    // Placeholder, will be populated below
    thresholds: {}
  };

  // Set labels with empty arrays to collect stats.
  for (const label of labels) {
    options.thresholds[`http_req_duration{name:${label}}`] = [];
    options.thresholds[`http_req_failed{name:${label}}`] = [];
    options.thresholds[`http_reqs{name:${label}}`] = [];
  }

  return options;
}

/**
 * Function to get token options map.
 * @param {string} ssn - social security number
 * @returns map of token options
 */
export function getTokenOpts(ssn) {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);
  tokenOpts.set("scopes", "altinn:authorization/authorize.admin");
  tokenOpts.set("pid", ssn);
  return tokenOpts;
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% read and write with Permit, 10% sign with NotApplicable.
 * @return {Array} [action, label, expectedResponse]
 */
export function getActionLabelAndExpectedResponse(denyLabel, permitLabel) {
  const randNumber = randomIntBetween(0, 10);
  switch (randNumber) {
    case 0:
      return ["sign", denyLabel, 'NotApplicable'];
    case 1, 3, 5, 7, 9:
      return ["read", permitLabel, 'Permit'];
    default:
      return ["write", permitLabel, 'Permit'];
  }
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const segmentedData = segmentData(parties, numberOfVUs);
  return segmentedData;
}
