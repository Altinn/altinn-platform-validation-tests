import { fail } from "k6";

import { ConnectionsClient, GetResourceDelegationCheckQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { buildAuthorizeRequest, buildXacmlJsonAttributeExternal } from "../../../../../clients/authorization/builders.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { GetResourceDelegationCheck } from "../../../../building-blocks/access-management/enduser/connections/index.js";

/**
 * The resource every request in this folder asks for. Provisioned in at22, at23
 * and tt02 with the same policy. Every action in it is delegable for priv, dagl
 * and seln.
 */
export const RESOURCE = "ttd-enkeltrettigheter-rightkeys";

/**
 * The actions the resource's policy grants, one right key each.
 */
export const ACTIONS = [
    "read", "write", "delete", "confirm", "sign", "instantiate", "complete",
    "pay", "reject", "subscribe", "publish", "scopeaccess", "access",
];

const ENDUSER_SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
]);

/**
 * One row of the test data: a daglig leder and the organization they lead. The
 * same row serves as a person acting for themselves (partyUuid) and as the
 * organization acted for by its daglig leder (orgUuid), which is what lets one
 * fixture cover both sides of a request.
 *
 * @typedef {object} EnduserRow
 * @property {string} pid The daglig leder's national identity number.
 * @property {string} partyUuid The daglig leder's party uuid.
 * @property {string} orgUuid The organization's party uuid.
 * @property {string} orgNo The organization number.
 * @property {string} lastName The daglig leder's last name, which adding them as a connection asks for next to the pid.
 * @property {string} userId The daglig leder's Altinn user id, which the decision point needs to see the person acting for themselves.
 * @property {string} partyId The daglig leder's Altinn party id.
 */

/**
 * @typedef {object} RequestV2TestData
 * @property {Array<EnduserRow>} users The rows a request can go between.
 * @property {{[action: string]: string}} rightKeys The resource's right key per action.
 */

/**
 * Loads the fixture and reads the resource's right keys.
 *
 * @returns {RequestV2TestData} Test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    // fetchTestData reads from main, where this fixture is not yet. Read from
    // the branch until it is merged, then switch to the relative path below.
    // TODO: replace with "access-management/enduser/request-v2" when merged.
    const base = __ENV.TEST_DATA_BASE_URL
        ?? "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/feat/request-v2-rightkeys/K6/testdata/access-management/enduser/request-v2";

    /** @type {Array<EnduserRow>} */
    const users = fetchTestData(`${base}/${__ENV.ENVIRONMENT}.csv`);

    if (users.length < 2) {
        fail(`request-v2/${__ENV.ENVIRONMENT}.csv has ${users.length} rows; a request needs two`);
    }

    return {
        users,
        rightKeys: fetchRightKeys(users[0]),
    };
}

/**
 * Creates and caches the token generator and the clients once per k6 runtime.
 *
 * The clients are built for nobody in particular: which person a call acts as
 * is decided by swapping the options with setTokenGeneratorOptions and
 * getEnduserOpts. BaseTokenGenerator keys its cache on the option set, so
 * several persons cost one token each without the clients being rebuilt.
 *
 * @returns {{connections: ConnectionsClient, requests: RequestV2Client, tokenGenerator: PersonalTokenGenerator}} The clients and their token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(getEnduserOpts());

    return {
        connections: new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        requests: new RequestV2Client(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * Token options for acting as one person, or for nobody when no row is given.
 *
 * userId and partyId become the urn:altinn:userid and urn:altinn:partyid
 * claims. The decision point does not recognize a person acting for themselves
 * without them, so a request from a token lacking them is answered 403.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {EnduserRow|null} [user] The row of the person to act as, or null for a token without a person.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getEnduserOpts(user = null) {
    const builder = new PersonalTokenBuilder()
        .withScopes(ENDUSER_SCOPES);

    if (user === null) {
        return builder.build();
    }

    return builder
        .withPid(user.pid)
        .withPartyUuid(user.partyUuid)
        .withUserId(user.userId)
        .withPartyId(user.partyId)
        .build();
}

/**
 * Reads the resource's right keys from the delegation check, one per action.
 *
 * The request endpoints take the key the delegation check reports as
 * `right.key`, a hash issued per right. It is not the action name, and not the
 * `rightKey` the resource registry's policy/rights returns either: both are
 * answered 400 AM.VLD-00054. The Bruno suite reads the keys the same way. The
 * check needs a party to ask for, but the keys do not depend on it, so the
 * first user serves. Read once here rather than per iteration: they are the
 * same for every pair, and the iteration should only be the flow being measured.
 *
 * @param {EnduserRow} user The person to ask the delegation check as.
 * @returns {{[action: string]: string}} The right key per action.
 */
function fetchRightKeys(user) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(user));

    const resourceCheck = GetResourceDelegationCheck(
        connections,
        new GetResourceDelegationCheckQueryBuilder()
            .withParty(user.partyUuid)
            .withResource(RESOURCE)
            .build(),
        { step: "setup-fetch-right-keys" },
    );

    /** @type {{[action: string]: string}} */
    const rightKeys = {};

    for (const entry of /** @type {Array<*>} */ (resourceCheck?.rights ?? [])) {
        const action = entry?.right?.action?.value;
        const key = entry?.right?.key;

        if (action && key) {
            rightKeys[action] = key;
        }
    }

    const missing = ACTIONS.filter((action) => rightKeys[action] === undefined);

    if (missing.length > 0) {
        fail(`${RESOURCE} has no right key for ${JSON.stringify(missing)}; the policy is not the one the tests expect`);
    }

    return rightKeys;
}

/**
 * Builds the XACML request asking whether a person may perform an action on the
 * resource on behalf of an organization. This is the question a service asks
 * Altinn when the person tries to use the right, so it is what shows whether the
 * approval gave exactly what was approved.
 *
 * @param {EnduserRow} person The person acting.
 * @param {EnduserRow} org The row whose organization the person acts for.
 * @param {string} action The action, e.g. read or write.
 * @returns {*} The authorization request.
 */
export function authorizeRequest(person, org, action) {
    return buildAuthorizeRequest(action, [
        buildXacmlJsonAttributeExternal({ attributeId: "urn:altinn:person:identifier-no", value: person.pid }),
    ], [
        buildXacmlJsonAttributeExternal({ attributeId: "urn:altinn:resource", value: RESOURCE }),
        buildXacmlJsonAttributeExternal({ attributeId: "urn:altinn:organization:identifier-no", value: org.orgNo }),
    ]);
}
