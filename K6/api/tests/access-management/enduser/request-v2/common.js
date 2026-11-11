import { fail } from "k6";
import exec from "k6/execution";

import { ConnectionsClient, CreateConnectionQueryBuilder, DeleteConnectionQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { ResourceClient } from "../../../../../clients/resource-registry/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, lazy, requireEnv, segmentData } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { CreateConnection, DeleteConnection } from "../../../../building-blocks/access-management/enduser/connections/index.js";
import { ResourceGetPolicyRights } from "../../../../building-blocks/resource-registry/resource/index.js";

/**
 * The resource every request in this folder asks for. Provisioned in at22, at23
 * and tt02 with the same policy, so its right keys are the same in every
 * environment. Every action in it is delegable for priv, dagl and seln.
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
 * A person acting for themselves, one row of persons/<env>.csv.
 *
 * @typedef {object} PersonRow
 * @property {string} pid National identity number.
 * @property {string} partyUuid Party uuid of the person.
 * @property {string} userId Altinn user id, which the decision point needs to see the person acting for themselves.
 * @property {string} partyId Altinn party id.
 * @property {string} lastName Last name, which adding the person as a connection asks for next to the pid.
 */

/**
 * An organization and its daglig leder, one row of orgs/<env>.csv. The person
 * columns describe the daglig leder; the token is always the person's, and the
 * organization is named per request through the `party` parameter.
 *
 * @typedef {object} OrgRow
 * @property {string} pid National identity number of the daglig leder.
 * @property {string} partyUuid Party uuid of the daglig leder.
 * @property {string} userId Altinn user id of the daglig leder.
 * @property {string} partyId Altinn party id of the daglig leder.
 * @property {string} lastName Last name of the daglig leder.
 * @property {string} orgUuid Party uuid of the organization.
 * @property {string} orgNo Organization number.
 */

/**
 * One person and one organization that a request goes between.
 *
 * @typedef {object} Pair
 * @property {PersonRow} person The person who asks for access.
 * @property {OrgRow} org The organization that receives the request, acted for by its daglig leder.
 */

/**
 * @typedef {object} RequestV2TestData
 * @property {Array<Array<Pair>>} pairs One slice of pairs per VU.
 * @property {{[action: string]: string}} rightKeys The resource's right key per action.
 */

/**
 * Loads the fixtures, reads the resource's right keys and makes sure every pair
 * this run can reach has the connection a request needs.
 *
 * Persons and organizations are two files so each list can grow on its own. Row
 * i of one is paired with row i of the other, and the pairs are split per VU, so
 * two VUs never make requests between the same parties.
 *
 * The connection is arranged here rather than per iteration so the iteration is
 * only the flow being measured. It is the organization that adds the person:
 * approving the request delegates from the organization to the person, and that
 * needs the person to be a rightholder of the organization. Only the pairs this
 * run can draw are set up, so a functional run with one iteration costs one
 * connection, not one per row.
 *
 * @returns {RequestV2TestData} Test data, one slice of pairs per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    // fetchTestData reads from main, where these fixtures are not yet. Read from
    // the branch until it is merged, then switch to the relative path below.
    // TODO: replace with "access-management/enduser/request-v2" when merged.
    const base = __ENV.TEST_DATA_BASE_URL
        ?? "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/feat/request-v2-rightkeys/K6/testdata/access-management/enduser/request-v2";

    /** @type {Array<PersonRow>} */
    const persons = fetchTestData(`${base}/persons/${__ENV.ENVIRONMENT}.csv`);
    /** @type {Array<OrgRow>} */
    const orgs = fetchTestData(`${base}/orgs/${__ENV.ENVIRONMENT}.csv`);

    const pairs = persons
        .slice(0, Math.min(persons.length, orgs.length))
        .map((person, index) => ({ person, org: orgs[index] }));

    if (pairs.length === 0) {
        fail(`No pairs to request between: persons/${__ENV.ENVIRONMENT}.csv has ${persons.length} rows and orgs/${__ENV.ENVIRONMENT}.csv has ${orgs.length}`);
    }

    const data = {
        pairs: segmentData(pairs, getNumberOfVUs()),
        rightKeys: fetchRightKeys(),
    };

    reachablePairs(data).forEach((pair) => {
        // A connection left behind by a run that was cut short would otherwise be
        // in the way, so it is removed first. Removing what is not there changes
        // nothing, and goes through the client rather than the building block so
        // the ordinary case does not report a check for it.
        sweepConnection(pair);

        if (addPersonAsRightholder(pair) === null) {
            fail(`Cannot set up the connection from ${pair.org.orgNo} to ${pair.person.pid}; nothing can be requested without it`);
        }
    });

    return data;
}

/**
 * Removes the connections setup made, with cascade, so the rights the approvals
 * delegated go with them and the next run starts from nothing.
 *
 * Walks the same pairs setup did rather than being told what the iterations
 * reached, so the two always agree. Goes through the building block, unlike the
 * sweep in setup: a cleanup that cannot reach the API leaves the environment
 * dirty for the next run, which is worth turning the run red for.
 *
 * @param {RequestV2TestData} data Test data, as setup returned it.
 * @param {{[key: string]: string}} label k6 request label for the delete step.
 * @returns {void}
 */
export function removeConnections(data, label) {
    const { connections, tokenGenerator } = getClients();

    reachablePairs(data).forEach((pair) => {
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(pair.org));

        DeleteConnection(
            connections,
            deleteConnectionQuery(pair),
            label,
        );
    });
}

/**
 * The pairs this run can draw: the first rows of each VU's slice, as many as
 * the VU gets iterations. A run without a fixed iteration count, such as a
 * smoke run over a duration, can reach every row, and gets every row.
 *
 * Cast for the same reason getNumberOfVUs does it: Scenario is a union and only
 * some of its members carry vus and iterations.
 *
 * @param {RequestV2TestData} data Test data, as setup returned it.
 * @returns {Array<Pair>} The pairs setup arranges and teardown removes.
 */
export function reachablePairs(data) {
    const scenario = /** @type {*} */ (exec.test.options.scenarios?.default);
    const iterations = scenario?.iterations;

    if (iterations === undefined) {
        return data.pairs.flat();
    }

    const vus = scenario?.vus ?? 1;
    const perVu = scenario?.executor === "shared-iterations"
        ? Math.ceil(iterations / vus)
        : iterations;

    return data.pairs.flatMap((slice) => slice.slice(0, perVu));
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
 * @param {PersonRow|OrgRow|null} [row] The row of the person to act as, or null for a token without a person.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getEnduserOpts(row = null) {
    const builder = new PersonalTokenBuilder()
        .withScopes(ENDUSER_SCOPES);

    if (row === null) {
        return builder.build();
    }

    return builder
        .withPid(row.pid)
        .withPartyUuid(row.partyUuid)
        .withUserId(row.userId)
        .withPartyId(row.partyId)
        .build();
}

/**
 * Reads the resource's right keys from the resource registry, one per action.
 *
 * The keys are opaque and issued per right, so they have to be read rather than
 * constructed. Read once here rather than per iteration: they are the same for
 * every pair, and the iteration should only be the flow being measured.
 *
 * @returns {{[action: string]: string}} The right key per action.
 */
function fetchRightKeys() {
    const resourceClient = new ResourceClient(__ENV.BASE_URL, getClients().tokenGenerator);

    const rights = ResourceGetPolicyRights(resourceClient, RESOURCE, { step: "fetch-right-keys" });

    /** @type {{[action: string]: string}} */
    const rightKeys = {};

    for (const right of rights ?? []) {
        const action = right.action?.value;

        if (action && right.rightKey) {
            rightKeys[action] = right.rightKey;
        }
    }

    const missing = ACTIONS.filter((action) => rightKeys[action] === undefined);

    if (missing.length > 0) {
        fail(`${RESOURCE} has no right key for ${JSON.stringify(missing)}; the policy is not the one the tests expect`);
    }

    return rightKeys;
}

/**
 * Has the organization add the person as a rightholder, as its daglig leder.
 *
 * Adding a person goes by pid and last name in the body rather than by party in
 * the query, which is why the person row carries the last name.
 *
 * @param {Pair} pair The person and organization.
 * @returns {*} The created assignment, or null when the connection could not be made.
 */
function addPersonAsRightholder(pair) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(pair.org));

    return CreateConnection(
        connections,
        new CreateConnectionQueryBuilder()
            .withParty(pair.org.orgUuid)
            .build(),
        { personIdentifier: pair.person.pid, lastName: pair.person.lastName },
        { step: "setup-create-connection" },
    );
}

/**
 * Removes the connection from the organization to the person if there is one,
 * reporting nothing either way.
 *
 * @param {Pair} pair The person and organization.
 * @returns {void}
 */
function sweepConnection(pair) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(pair.org));

    const res = connections.DeleteConnection(deleteConnectionQuery(pair), { step: "setup-sweep-connection" });

    if (res.status !== 200 && res.status !== 204) {
        console.warn(`setup - could not sweep the connection from ${pair.org.orgNo} to ${pair.person.pid}: ${res.status}`);
    }
}

/**
 * The query that names the connection from the organization to the person.
 * Shared by the sweep in setup and the removal in teardown, which has to name a
 * connection it never saw created.
 *
 * @param {Pair} pair The person and organization.
 * @returns {*} The delete query.
 */
function deleteConnectionQuery(pair) {
    return new DeleteConnectionQueryBuilder()
        .withParty(pair.org.orgUuid)
        .withFrom(pair.org.orgUuid)
        .withTo(pair.person.partyUuid)
        .withCascade(true)
        .build();
}
