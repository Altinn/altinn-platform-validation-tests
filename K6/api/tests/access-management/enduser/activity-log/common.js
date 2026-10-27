import { fail } from "k6";

import { ActivityTypeDto } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogArea, ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getItemFromList, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";

/**
 * @typedef {object} ActivityLogUser
 * @property {string} pid National identity number of the daglig leder.
 * @property {string} partyUuid Party UUID of the daglig leder.
 * @property {string} orgUuid Party UUID of the organization they lead.
 * @property {string} orgNo
 * @property {string} lastName
 */

/**
 * @typedef {object} ActivityLogSetupData
 * @property {ActivityLogUser[]} users The users whose organizations' logs are read.
 * @property {{[area: string]: string[]}} filterFields The fields each area
 * can be filtered on, as its `filter/fields` endpoint lists them.
 * @property {{[area: string]: ActivityTypeDto[]}} types The activity types
 * each area can hold, as its `types` endpoint lists them.
 */

/**
 * An activity type, told apart by what its entries carry: `[type, subtype,
 * trigger, status]`.
 *
 * @typedef {[string, string|null, string, string|null]} ActivityTypeKey
 */

/**
 * Environments where testdataGeneration/activity-log-data.js has filled the
 * activity log of the organizations in activity-log/<env>.csv. Elsewhere the
 * tests fall back to the "be om tilgang" users, whose logs are small.
 */
const FILLED_ENVIRONMENTS = ["yt01"];

/**
 * Creates and caches one activity log client per area, sharing one
 * {@link PersonalTokenGenerator} that is pointed at a new user every
 * iteration by {@link useNextUser}.
 *
 * @returns {{connections: ActivityLogClient, request: ActivityLogClient, maskinporten: ActivityLogClient, tokenGenerator: PersonalTokenGenerator}}
 * The clients, keyed by area, and the token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(getTokenOpts());

    return {
        connections: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.CONNECTIONS),
        request: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.REQUEST),
        maskinporten: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.MASKINPORTEN),
        tokenGenerator,
    };
});

/**
 * Creates and caches one activity log client per area for the endpoints that
 * need no token, `types` and `filter/fields`. Kept apart from
 * {@link getClients} so reading them needs no token generator credentials.
 *
 * @returns {{connections: ActivityLogClient, request: ActivityLogClient, maskinporten: ActivityLogClient}}
 * The clients, keyed by area.
 */
export const getMetadataClients = lazy(function () {
    return {
        connections: new ActivityLogClient(__ENV.BASE_URL, null, ActivityLogArea.CONNECTIONS),
        request: new ActivityLogClient(__ENV.BASE_URL, null, ActivityLogArea.REQUEST),
        maskinporten: new ActivityLogClient(__ENV.BASE_URL, null, ActivityLogArea.MASKINPORTEN),
    };
});

/**
 * Builds personal-token options for a user. The activity log is read through
 * the same portal scope the Altinn UI uses.
 *
 * @param {string|null} [pid] The user's national identity number.
 * @param {string|null} [partyUuid] The user's party UUID.
 * @returns Token generator options for the user.
 */
export function getTokenOpts(pid = null, partyUuid = null) {
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]));

    if (pid !== null) {
        tokenOpts.withPid(pid);
    }
    if (partyUuid !== null) {
        tokenOpts.withPartyUuid(partyUuid);
    }
    return tokenOpts.build();
}

/**
 * k6 setup stage.
 *
 * Each row is an organization and its daglig leder, who may read the
 * organization's activity log: the organizations whose logs were filled where
 * there are any (see {@link FILLED_ENVIRONMENTS}), the "be om tilgang" users
 * elsewhere. Also asks each area which fields it can be filtered on, since that
 * differs per area (e.g. maskinporten has no `Package` filter), and which
 * activity types it holds, whose ids the tests filter on.
 *
 * The users are not split per VU: the tests only read, so several VUs reading
 * the same organization's log at once is fine, and a run can use more VUs than
 * there are organizations.
 *
 * @returns {ActivityLogSetupData} The users, and the filter fields and types per area.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const folder = FILLED_ENVIRONMENTS.includes(__ENV.ENVIRONMENT) ? "activity-log" : "request";
    const users = fetchTestData(`access-management/enduser/${folder}/${__ENV.ENVIRONMENT}.csv`);

    const clients = getMetadataClients();
    /** @type {{[area: string]: string[]}} */
    const filterFields = {};
    /** @type {{[area: string]: ActivityTypeDto[]}} */
    const types = {};
    for (const area of Object.values(ActivityLogArea)) {
        types[area] = EndUserBuildingBlocks.ActivityLog.GetActivityLogTypes(
            clients[area],
            { action: "fetch-activity-log-types" },
        ) ?? [];

        filterFields[area] = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterFields(
            clients[area],
            { action: "fetch-activity-log-filter-fields" },
        ) ?? [];

        if (filterFields[area].length === 0) {
            fail(`No filter fields for the ${area} activity log; is it deployed in ${__ENV.ENVIRONMENT}?`);
        }
    }

    return {
        users,
        filterFields,
        types,
    };
}

/**
 * Draws this iteration's user and points the token generator at them.
 *
 * @param {ActivityLogSetupData} data Setup data.
 * @returns {ActivityLogUser} The user to act as.
 */
export function useNextUser(data) {
    const user = getItemFromList(data.users, (__ENV.RANDOMIZE ?? "true") === "true");
    getClients().tokenGenerator.setTokenGeneratorOptions(getTokenOpts(user.pid, user.partyUuid));
    return user;
}

/**
 * Picks the activity types of an area that match the given keys, so a test
 * can filter on the types its test data holds rather than on all of them,
 * most of which would come back empty.
 *
 * @param {ActivityTypeDto[]} types The area's types, from setup.
 * @param {ActivityTypeKey[]} keys The types to pick.
 * @returns {ActivityTypeDto[]} The matching types.
 */
export function pickTypes(types, keys) {
    return types.filter((type) => keys.some(([kind, subtype, trigger, status]) =>
        type.type === kind && type.subtype === subtype && type.trigger === trigger && type.status === status));
}

/**
 * The window the filtered tests read: the last 90 days, as the portal's period
 * filter would ask for it.
 *
 * @returns {{after: string, before: string}} Start and end, ISO date-time.
 */
export function lastNinetyDays() {
    const before = new Date();
    const after = new Date(before.getTime() - 90 * 24 * 60 * 60 * 1000);

    return { after: after.toISOString(), before: before.toISOString() };
}
