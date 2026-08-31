import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * One row of client delegation v2 test data.
 *
 * Three parties are involved and it is easy to mix them up. The column names
 * follow the ones the client admin fixture already uses for the same shape:
 * `partyUuid` and `userId` are the person, `orgUuid` is the organisation that
 * person acts for.
 *
 * The token identifies the person, never the organisation. A token carrying
 * only the organisation's own party uuid is answered 403 by `/clients` and
 * `/agents`, whichever organisation the request names. The organisation is named
 * per request instead, through the `party` query parameter.
 *
 * The client the resource is delegated from, the agent it is delegated to and
 * the role it goes through are not columns here. The test reads them off the v1
 * API at runtime, because the role has to be one that client relationship
 * actually grants, which only the API knows.
 *
 * @typedef {object} ClientDelegationV2TestRow
 * @property {string} partyUuid Party uuid of the person who administers the organisation, a dagligleder in the Bruno fixtures.
 * @property {string} userId User id of that same person.
 * @property {string} orgUuid Party uuid of the organisation in the middle.
 * @property {string} resource Resource that gets delegated and then removed. It has to be one the client's role may delegate onwards, which the API decides, so it cannot be discovered from the outside.
 */

/**
 * The columns setup insists on carrying a value.
 *
 * Every one of them is environment specific and none survives being guessed.
 * Leave a cell blank rather than filling it with something plausible: setup
 * names whichever are still empty.
 *
 * @type {(keyof ClientDelegationV2TestRow)[]}
 */
const REQUIRED_COLUMNS = ["partyUuid", "userId", "orgUuid", "resource"];

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
 * A row that exists but is still blank fails here rather than deeper in, so a
 * half-filled fixture reports which columns it is missing instead of a 400 from
 * the API.
 *
 * @returns {ClientDelegationV2TestRow[]} One entry per row in the fixture.
 * @throws {Error} If any row has blank required columns.
 */
export function getTestData() {
    const environment = __ENV.ENVIRONMENT;
    const path = `access-management/enduser/client-delegations-v2/${environment}.csv`;

    /** @type {ClientDelegationV2TestRow[]} */
    const rows = fetchTestData(path);

    rows.forEach((row, index) => {
        const missing = REQUIRED_COLUMNS.filter((column) => !row[column]);

        if (missing.length > 0) {
            throw new Error(
                `Client delegation v2 test data for ${environment} is missing ${missing.join(", ")} on row ${index + 1}. Fill it in in K6/testdata/${path}.`,
            );
        }
    });

    return rows;
}

/**
 * Builds the enduser token options for the person acting for the organisation.
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
 * @param {ClientDelegationV2TestRow} row Test data naming the person to act as.
 * @returns {{clientDelegation: ClientDelegationClient, clientDelegationV2: ClientDelegationV2Client}} The clients.
 */
export function getClients(row) {
    const opts = getTokenOpts(row.userId, row.partyUuid);

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
 * The fixture is read from main, so a new environment only takes effect once its
 * csv has merged.
 *
 * @returns {ClientDelegationV2TestRow[]} The test data for the environment.
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
