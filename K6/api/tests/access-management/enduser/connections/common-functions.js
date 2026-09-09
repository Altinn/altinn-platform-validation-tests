
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, lazy, requireEnv, segmentData } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

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
export const getClients = lazy(function () {
    const scopes = CreateScopeString([
        AltinnScopes.PDP.AUTHORIZE.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    const tokenGenerator = new PersonalTokenGenerator(tokenOpts);

    /** @type {[ConnectionsClient, PersonalTokenGenerator]} */
    const clients = [
        new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    ];

    return clients;
});

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
 * @returns {any[][]} Organizations with a party uuid, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management/enduser/connections/${__ENV.ENVIRONMENT}.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}
