import { fail } from "k6";
import exec from "k6/execution";

import { ActivityLogArea, ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, lazy, requireEnv, segmentData } from "../../../../../helpers.js";
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
 * @property {ActivityLogUser[][]} users Users, one slice per VU.
 * @property {{[area: string]: string[]}} filterFields The fields each area
 * can be filtered on, as its `filter/fields` endpoint lists them.
 */

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
 * Reuses the "be om tilgang" users: each row is an organization and its daglig
 * leder, who may read the organization's activity log. Also asks each area
 * which fields it can be filtered on, since that differs per area (e.g.
 * maskinporten has no `Package` filter).
 *
 * @returns {ActivityLogSetupData} Users split per VU, and the filter fields per area.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const users = fetchTestData(`access-management/enduser/request/${__ENV.ENVIRONMENT}.csv`);

    const clients = getMetadataClients();
    /** @type {{[area: string]: string[]}} */
    const filterFields = {};
    for (const area of Object.values(ActivityLogArea)) {
        filterFields[area] = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterFields(
            clients[area],
            { action: "fetch-activity-log-filter-fields" },
        ) ?? [];

        if (filterFields[area].length === 0) {
            fail(`No filter fields for the ${area} activity log; is it deployed in ${__ENV.ENVIRONMENT}?`);
        }
    }

    return {
        users: segmentData(users, getNumberOfVUs()),
        filterFields,
    };
}

/**
 * Draws this iteration's user from the VU's slice and points the token
 * generator at them.
 *
 * @param {ActivityLogSetupData} data Setup data.
 * @returns {ActivityLogUser} The user to act as.
 */
export function useNextUser(data) {
    const user = getItemFromList(
        data.users[exec.vu.idInTest - 1],
        (__ENV.RANDOMIZE ?? "true") === "true",
    );
    getClients().tokenGenerator.setTokenGeneratorOptions(getTokenOpts(user.pid, user.partyUuid));
    return user;
}
