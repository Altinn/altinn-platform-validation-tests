import http from "k6/http";

import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getNumberOfVUs, parseCsvData, requireEnv, segmentData } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * @type {ConnectionsClient | undefined}
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
 * {@link ConnectionsClient} instances are reused on subsequent calls.
 *
 * @returns {[
 * ConnectionsClient,
 * PersonalTokenGenerator
 * ]} The initialized API client and token generator.
 */
export function getClients() {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.PDP.AUTHORIZE.ENDUSER
        ]);
        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }

    if (connectionsApiClient == undefined) {
        connectionsApiClient = new ConnectionsClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );
    }

    return [connectionsApiClient, tokenGenerator];
}

/**
 * Function to get token options map.
 *
 * @param {string} userId - the user's id
 * @returns map of token options
 */
export function getTokenOpts(userId) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .withUserId(userId)
        .build();

    return tokenOpts;
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations with a party uuid, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
