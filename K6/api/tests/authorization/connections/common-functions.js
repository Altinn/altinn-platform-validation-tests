import http from "k6/http";

import { CreateScopeString, PDP_AUTHORIZE_ENDUSER_SCOPE, PORTAL_ENDUSER_SCOPE } from "../../../../../scopes.js";
import { ConnectionsApiClient } from "../../../../clients/authorization/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
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
 * ConnectionsApiClient,
 * PersonalTokenGenerator
 * ]} The initialized API client and token generator.
 */
export function getClients(bff = false) {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            PDP_AUTHORIZE_ENDUSER_SCOPE
        ]);
        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();
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
 *
 * @param userId TODO: description
 * @returns map of token options
 */
export function getTokenOpts(userId) {
    const scopes = CreateScopeString([
        PORTAL_ENDUSER_SCOPE
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
 * @returns TODO: description
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
