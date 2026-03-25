import http from "k6/http";
import { ConnectionsApiClient } from "../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../helpers.js";

let connectionsApiClient = undefined;
let tokenGenerator = undefined;

/**
 * Function to set up and return clients to interact with the /enduser/connections API
 *
 * @returns {Array} An array containing the ConnectionsApiClient and PersonalTokenGenerator instances
 */
export function getClients(bff=false) {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionsApiClient(__ENV.BASE_URL, tokenGenerator, bff);
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
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
