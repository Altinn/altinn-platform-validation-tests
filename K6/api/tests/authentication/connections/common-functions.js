import http from "k6/http";

import { ConnectionsApiClient } from "../../../../clients/authentication/index.js";
import { PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../common-imports.js";
import { getNumberOfVUs, parseCsvData, requireEnv, segmentData } from "../../../../helpers.js";

/**
 * @type {ConnectionsApiClient | undefined}
 */
let connectionsApiClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the clients used to interact with the
 * `/enduser/connections` API.
 *
 * The same {@link PersonalTokenGenerator} and
 * {@link ConnectionsApiClient} instances are reused on subsequent calls.
 *
 * @param {boolean} [bff=false] - Whether to configure the client for BFF endpoints.
 * @returns {[
 *   ConnectionsApiClient,
 *   PersonalTokenGenerator
 * ]} The initialized API client and token generator.
 */
export function getClients(bff = false) {
    if (tokenGenerator == undefined) {
        const tokenOpts = new PersonalTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }

    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionsApiClient(
            __ENV.BASE_URL,
            tokenGenerator,
            bff
        );
    }

    return [connectionsApiClient, tokenGenerator];
}

/**
 * Function to get token options map.
 * @param {string} ssn - social security number
 * @returns map of token options
 */
export function getTokenOpts(userId) {
    const tokenOpts = new PersonalTokenGeneratorOptions();
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
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
