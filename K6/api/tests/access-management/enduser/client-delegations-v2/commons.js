import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * Test data per environment.
 *
 * `party` is the organisation whose clients and agents the test works with. It
 * has to be a party that has at least one client and at least one agent, since
 * the test delegates from the former to the latter.
 *
 * `resourceRefId` is the resource that gets delegated and then removed. It has
 * to be a resource the client's role can actually delegate, which the API
 * decides, so it cannot be discovered from the outside.
 *
 * Both values are environment specific and neither survives being guessed. Fill
 * in an environment before enabling the test for it, rather than adding an entry
 * with placeholder values.
 *
 * @type {{[environment: string]: {party: string, resourceRefId: string}}}
 */
const TEST_DATA = {};

/**
 * The scopes the v2 resource endpoints ask for.
 *
 * The portal scope gets the caller through the enduser API, and the two
 * clientdelegations scopes are what the endpoints themselves are guarded with.
 */
const SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
    AltinnScopes.CLIENTDELEGATIONS.READ,
    AltinnScopes.CLIENTDELEGATIONS.WRITE,
]);

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * @type {{clientDelegation: ClientDelegationClient, clientDelegationV2: ClientDelegationV2Client} | undefined}
 */
let clients = undefined;

/**
 * Returns the test data for the environment the run is against.
 *
 * @returns {{party: string, resourceRefId: string}} The party and resource to work with.
 * @throws {Error} If the environment has no test data configured.
 */
export function getTestData() {
    const environment = __ENV.ENVIRONMENT;
    const data = TEST_DATA[environment];

    if (data === undefined) {
        throw new Error(
            `No client delegation v2 test data for ${environment}. Add a party and a resourceRefId for it in commons.js.`,
        );
    }

    return data;
}

/**
 * Builds the enduser token options for a party.
 *
 * @param {string} partyUuid Party uuid the caller acts as.
 * @returns {object} Token generator options.
 */
export function getTokenOpts(partyUuid) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(SCOPES)
        .withPartyUuid(partyUuid)
        .build();
}

/**
 * Returns the clients the test calls with, building them on first use.
 *
 * Both the v1 and the v2 client are needed: v1 lists the clients and agents the
 * delegation goes between, which v2 has no endpoint of its own for, and v2 does
 * the resource work.
 *
 * @param {string} partyUuid Party uuid the caller acts as.
 * @returns {{clientDelegation: ClientDelegationClient, clientDelegationV2: ClientDelegationV2Client}} The clients.
 */
export function getClients(partyUuid) {
    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(getTokenOpts(partyUuid));
    } else {
        tokenGenerator.setTokenGeneratorOptions(getTokenOpts(partyUuid));
    }

    if (clients === undefined) {
        clients = {
            clientDelegation: new ClientDelegationClient(__ENV.BASE_URL, tokenGenerator),
            clientDelegationV2: new ClientDelegationV2Client(__ENV.BASE_URL, tokenGenerator),
        };
    }

    return clients;
}

/**
 * k6 setup stage. Declares what the tests in this folder need.
 *
 * @returns {{party: string, resourceRefId: string}} The test data for the environment.
 */
export function setup() {
    requireEnv([
        "ENVIRONMENT",
        "BASE_URL",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    return getTestData();
}
