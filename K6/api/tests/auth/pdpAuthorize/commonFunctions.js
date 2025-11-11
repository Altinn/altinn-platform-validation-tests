import http from 'k6/http';
import { PdpAuthorizeClient } from "../../../../clients/auth/index.js"
import { PersonalTokenGenerator, randomIntBetween } from '../../../../commonImports.js';
import { segmentData, parseCsvData, getNumberOfVUs } from '../../../../helpers.js';


let pdpAuthorizeClient = undefined;
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
  if (pdpAuthorizeClient == undefined) {
    pdpAuthorizeClient = new PdpAuthorizeClient(__ENV.BASE_URL, tokenGenerator);
  }
  return [pdpAuthorizeClient, tokenGenerator];
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
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/auth/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  return segmentedData;
}
