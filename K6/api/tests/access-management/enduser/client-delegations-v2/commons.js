import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { REQUIRED_FIELDS, TEST_DATA } from "./testdata.js";

/**
 * Reads a dotted path off an object.
 *
 * @param {object} source Object to read from.
 * @param {string} path Dotted path, as listed in REQUIRED_FIELDS.
 * @returns {*} The value, or undefined when any step is missing.
 */
function readPath(source, path) {
    return path.split(".").reduce(
        (/** @type {*} */ value, key) => (value === null || value === undefined ? undefined : value[key]),
        /** @type {*} */ (source),
    );
}

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
 * An entry that exists but is still blank fails here rather than deeper in, so
 * a half-filled environment reports which fields it is missing instead of a
 * 400 from the API.
 *
 * @returns {import("./testdata.js").ClientDelegationV2TestData} The actors and the resource to work with.
 * @throws {Error} If the environment has no test data, or has blank required fields.
 */
export function getTestData() {
    const environment = __ENV.ENVIRONMENT;
    const data = TEST_DATA[environment];

    if (data === undefined) {
        throw new Error(
            `No client delegation v2 test data for ${environment}. Add an entry for it in testdata.js.`,
        );
    }

    const missing = REQUIRED_FIELDS.filter((field) => !readPath(data, field));

    if (missing.length > 0) {
        throw new Error(
            `Client delegation v2 test data for ${environment} is missing ${missing.join(", ")}. Fill it in in testdata.js.`,
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
 * @param {import("./testdata.js").ClientDelegationV2TestData} data Test data naming the person to act as.
 * @returns {{clientDelegation: ClientDelegationClient, clientDelegationV2: ClientDelegationV2Client}} The clients.
 */
export function getClients(data) {
    const opts = getTokenOpts(data.facilitator.user.userId, data.facilitator.user.partyUuid);

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
 * @returns {import("./testdata.js").ClientDelegationV2TestData} The test data for the environment.
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
