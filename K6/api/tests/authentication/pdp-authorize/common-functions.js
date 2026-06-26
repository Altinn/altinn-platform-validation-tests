import http from "k6/http";
import { PdpAuthorizeClient } from "../../../../clients/authentication/index.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions, randomIntBetween } from "../../../../common-imports.js";
import { segmentData, parseCsvData, getNumberOfVUs, requireEnv } from "../../../../helpers.js";


/**
 * Client used to interact with the PDP Authorize API.
 *
 * @type {PdpAuthorizeClient | undefined}
 */

let pdpAuthorizeClient = undefined;

/**
 * Generates personal access tokens for authenticated requests.
 *
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Initializes the clients required to interact with the PDP Authorize API.
 *
 * @returns {[PdpAuthorizeClient, PersonalTokenGenerator]} A tuple containing the
 * PDP Authorize client and the personal token generator.
 */
export function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new PersonalTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);

        // this scope means that the token can be used for all users,
        // no need to generate a token for each user in the test data
        tokenOpts.set("scopes", "altinn:authorization/authorize.admin");
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
            return ["sign", denyLabel, "NotApplicable"];
        case 1, 3, 5, 7, 9:
            return ["read", permitLabel, "Permit"];
        default:
            return ["write", permitLabel, "Permit"];
    }
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-dagl-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
