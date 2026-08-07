import http from "k6/http";

import { EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
} from "../../../common-imports.js";
import { parseCsvData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

/**
 * Test data for the register tests, one file per environment.
 *
 * Read over HTTP from main rather than from disk, so a branch-only edit to a file
 * changes nothing until it is merged.
 *
 * K6/testdata/register/
 * - register-usernames-<env>.csv   (header: username)
 * - ccr-facilitators-<env>.csv     (header: partyUuid,org,role)
 */
const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/register";

/**
 * @type {RegisterClient | undefined}
 */
let lookupClient = undefined;

/**
 * @type {RegisterClient | undefined}
 */
let partyLookupAdminClient = undefined;

/**
 * @type {EnhetsregisteretClient | undefined}
 */
let enhetsregisteretClient = undefined;

/**
 * Self-identified users to look up by username. Legacy ones, created through the
 * username form, so the username and the display name are the same string. An
 * ID-porten email user has neither the same display name nor, when it was created
 * in A3, a username at all.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {Array<{username: string}>} The usernames.
 */
export function getUsernames(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/register-usernames-${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });

    return parseCsvData(res.body);
}

/**
 * Facilitators to read customers for, ten per Enhetsregisteret role. Every one of
 * them was verified to have customers in its environment when the file was
 * generated, since a facilitator without customers gives the role test nothing to
 * remove.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {Array<{partyUuid: string, org: string, role: string}>} The facilitators.
 */
export function getFacilitators(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/ccr-facilitators-${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });

    return parseCsvData(res.body);
}

/**
 * Creates and caches the client the party lookups read with.
 *
 * The access-management party query takes a platform access token, which carries
 * no scopes and no identity, so this client cannot read the internal party
 * endpoints and getPartyLookupAdminClient cannot serve the query.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching it on every iteration.
 *
 * @returns {RegisterClient} The client the lookup tests read with.
 */
export function getLookupClient() {
    if (lookupClient === undefined) {
        const tokenGenerator = new PlatformTokenGenerator(
            new PlatformTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .build(),
        );

        lookupClient = new RegisterClient(
            __ENV.BASE_URL,
            tokenGenerator,
            __ENV.REGISTER_SUBSCRIPTION_KEY,
        );
    }

    return lookupClient;
}

/**
 * Creates and caches the client the internal party endpoints are read with.
 *
 * Those endpoints take a bearer token holding
 * `altinn:register/partylookup.admin`, which is what separates this client from
 * getLookupClient. The person the token is minted for does not matter, since the
 * scope is what grants the read.
 *
 * @returns {RegisterClient} The client the customer and holder reads go through.
 */
export function getPartyLookupAdminClient() {
    if (partyLookupAdminClient === undefined) {
        const tokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(
                    CreateScopeString([AltinnScopes.REGISTER.PARTYLOOKUP.ADMIN]),
                )
                .withPid(22877497392)
                .build(),
        );

        partyLookupAdminClient = new RegisterClient(
            __ENV.BASE_URL,
            tokenGenerator,
            __ENV.REGISTER_SUBSCRIPTION_KEY,
        );
    }

    return partyLookupAdminClient;
}

/**
 * Creates and caches the client for the ER update service.
 *
 * No token generator: the ER system user credentials go in the SOAP envelope, and
 * the test passes them per call.
 *
 * @returns {EnhetsregisteretClient} The client the role changes go through.
 */
export function getEnhetsregisteretClient() {
    if (enhetsregisteretClient === undefined) {
        enhetsregisteretClient = new EnhetsregisteretClient(__ENV.BASE_URL);
    }

    return enhetsregisteretClient;
}
