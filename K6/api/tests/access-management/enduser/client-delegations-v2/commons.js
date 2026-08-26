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
 * `userId` and `userPartyUuid` identify a person who administers that
 * organisation. The token has to carry that person while the request names the
 * organisation: a token whose only identity is the organisation's own party uuid
 * is rejected with 403 by `/clients` and `/agents`, whichever organisation it
 * names. `open-client-admin.js` splits them the same way.
 *
 * `resourceRefId` is the resource that gets delegated and then removed. It has
 * to be a resource the client's role can actually delegate, which the API
 * decides, so it cannot be discovered from the outside.
 *
 * Every value is environment specific and none survives being guessed. Fill in
 * an environment before enabling the test for it, rather than adding an entry
 * with placeholder values.
 *
 * @type {{[environment: string]: {party: string, userId: string, userPartyUuid: string, resourceRefId: string}}}
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
 * @returns {{party: string, userId: string, userPartyUuid: string, resourceRefId: string}} The organisation, the person acting for it, and the resource to work with.
 * @throws {Error} If the environment has no test data configured.
 */
export function getTestData() {
    const environment = __ENV.ENVIRONMENT;
    const data = TEST_DATA[environment];

    if (data === undefined) {
        throw new Error(
            `No client delegation v2 test data for ${environment}. Add a party, a userId, a userPartyUuid and a resourceRefId for it in commons.js.`,
        );
    }

    return data;
}

/**
 * Builds the enduser token options for the person acting for the organisation.
 *
 * The token identifies the person, not the organisation. The organisation is
 * named per request instead, through the `party` query parameter.
 *
 * @param {string} userId User id of the person administering the organisation.
 * @param {string} userPartyUuid That person's own party uuid.
 * @returns {object} Token generator options.
 */
export function getTokenOpts(userId, userPartyUuid) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(SCOPES)
        .withUserId(userId)
        .withPartyUuid(userPartyUuid)
        .build();
}

/**
 * Returns the clients the test calls with, building them on first use.
 *
 * Both the v1 and the v2 client are needed: v1 lists the clients and agents the
 * delegation goes between, which v2 has no endpoint of its own for, and v2 does
 * the resource work.
 *
 * @param {{userId: string, userPartyUuid: string}} data Test data naming the person to act as.
 * @returns {{clientDelegation: ClientDelegationClient, clientDelegationV2: ClientDelegationV2Client}} The clients.
 */
export function getClients(data) {
    const opts = getTokenOpts(data.userId, data.userPartyUuid);

    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(opts);
    } else {
        tokenGenerator.setTokenGeneratorOptions(opts);
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
 * @returns {{party: string, userId: string, userPartyUuid: string, resourceRefId: string}} The test data for the environment.
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
