import http from "k6/http";

import { ConnectionsApiClient, RequestApiClient } from "../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData, requireEnv } from "../../../../helpers.js";

/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {ConnectionsApiClient | undefined} */
let connectionsApiClient = undefined;
/** @type {RequestApiClient | undefined} */
let requestApiClient = undefined;

/**
 * k6 setup function.
 *
 * Fetches the "be om tilgang" test data from the branch on GitHub and parses it.
 * Each row holds an organization (Virksomhet) and its daglig leder:
 *   pid, partyUuid (daglig leder), orgUuid (Virksomhet), orgNo.
 *
 * @returns {Array} Parsed CSV rows used as test input.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/test/be-om-tilgang/K6/testdata/authentication/beomtilgang/${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return parseCsvData(res.body);
}

/**
 * Creates and caches the token generator and API clients. The same
 * {@link PersonalTokenGenerator} instance is reused and reconfigured per user
 * via {@link setEnduserOpts}, so all clients pick up the active user's token.
 *
 * @returns {[ConnectionsApiClient, RequestApiClient, PersonalTokenGenerator]}
 */
export function getClients() {
    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(getEnduserOpts());
    }
    if (connectionsApiClient === undefined) {
        connectionsApiClient = new ConnectionsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (requestApiClient === undefined) {
        requestApiClient = new RequestApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, requestApiClient, tokenGenerator];
}

/**
 * Builds enduser personal-token options for a given user.
 * @param {string=} pid - the user's national identity number
 * @param {string=} partyUuid - the user's party uuid
 * @returns {Map}
 */
export function getEnduserOpts(pid = null, partyUuid = null) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    if (pid !== null) {
        tokenOpts.set("pid", pid);
    }
    if (partyUuid !== null) {
        tokenOpts.set("partyuuid", partyUuid);
    }
    return tokenOpts;
}
