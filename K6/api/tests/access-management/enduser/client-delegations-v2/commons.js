import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, requireEnv, segmentData } from "../../../../../helpers.js";
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
 * @property {string} pid National identity number of that person. Nothing reads it: the token is built from userId and partyUuid, and those are what the endpoints answer on. It is here so a row says who it is about without a lookup, and so the rest can be regenerated for a new environment from the fnr alone.
 * @property {string} partyUuid Party uuid of the person who calls. The requirement is read and write on the altinn_client_administration resource for the facilitator, which a dagligleder has and the klientadministrator package also grants; dagligleder is how the fixtures happen to get it, not the rule. A person without it is answered 403.
 * @property {string} partyId Altinn party id of that person. Informational, like pid.
 * @property {string} userId User id of that same person.
 * @property {string} orgUuid Party uuid of the organisation in the middle.
 * @property {string} orgNo Organisation number of that same organisation. Informational in the same way as pid: the endpoints take the uuid, not the number.
 * @property {string} orgPartyId Altinn party id of that organisation. Informational, like orgNo.
 * @property {string} orgName Display name of that organisation. Informational, and only here to make a row readable; remove it if it stays unused.
 * @property {string} clientUuid Party uuid of the client to delegate from. Leave blank to let the test discover one, which makes the run depend on the order /clients happens to return.
 * @property {string} agentUuid Party uuid of the agent to delegate to, drawn from the agents fixture for the same environment. Blank means take the first person the party has registered, with the same caveat as clientUuid. Naming it is also what lets setup tell a reset environment from a working one: an empty agent list is a valid 200, so only checking the contents against a named agent turns that into a red run.
 * @property {string} roleCode Role the delegation goes through. Blank means discover, with the same caveat as clientUuid. What may be delegated onwards follows from the role-package coupling, and that coupling can be restricted to a unit variant, so an arbitrary role is not interchangeable with a chosen one.
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
 * @type {ClientDelegationV2Client | undefined}
 */
let client = undefined;

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
 * Returns the client the test calls with, building it on first use.
 *
 * One client, not two: v2 carries the client and agent listings as well as the
 * resource endpoints, so nothing here needs v1.
 *
 * @param {ClientDelegationV2TestRow} row Test data naming the person to act as.
 * @returns {ClientDelegationV2Client} The v2 Client Delegation API client.
 */
export function getClient(row) {
    const opts = getTokenOpts(row.userId, row.partyUuid);

    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(opts);
    } else {
        tokenGenerator.setTokenGeneratorOptions(opts);
    }

    if (client === undefined) {
        client = new ClientDelegationV2Client(__ENV.BASE_URL, tokenGenerator);
    }

    return client;
}

/**
 * k6 setup stage. Declares what the tests in this folder need.
 *
 * The fixture is read from main, so a new environment only takes effect once its
 * csv has merged.
 *
 * The rows are handed out one slice per VU. The test writes, so two VUs drawing
 * the same row would delegate and remove the same resource for the same client
 * and agent, and each would see the other removal as its own. Slicing keeps a VU
 * on rows nobody else touches.
 *
 * @returns {ClientDelegationV2TestRow[][]} The test data for the environment, one slice per VU.
 */
export function setup() {
    requireEnv([
        "ENVIRONMENT",
        "BASE_URL",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    return segmentData(getTestData(), getNumberOfVUs());
}
