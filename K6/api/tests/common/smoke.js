import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../common-imports.js";
import { getOptions, requireEnv } from "../../../helpers.js";
import { CreateScopeString } from "../../../scopes.js";

/**
 * Builds k6 options for a smoke test.
 *
 * A smoke test only sends read-only requests that the API is expected to
 * accept, so every check and every request must succeed. The shared
 * getOptions helper creates the tagged metrics but leaves the thresholds empty,
 * so this adds the two that make the run fail on a bad answer.
 *
 * @param {{ [key: string]: string }[]} labels Request labels the test uses.
 * @param {string[]} [groups] k6 group names the test wraps its steps in.
 * @returns {ReturnType<typeof getOptions>} Strict k6 options for the test.
 */
export function getSmokeOptions(labels, groups = []) {
    const options = getOptions(labels, groups);

    options.thresholds.checks = ["rate>=1.0"];
    options.thresholds.http_req_failed = ["rate<=0.0"];

    return options;
}

/**
 * Resolves the test data a smoke test needs in the active environment.
 *
 * Each family keeps a table of per-environment defaults (org, app, user and
 * so on) and a map from configuration key to the env var that overrides it,
 * so an ad hoc run can point the test at other data without editing the
 * table. An environment that is not in the table gets no defaults and must
 * supply everything through env vars.
 *
 * Fails on the spot, naming every key that is missing and the env var that
 * would supply it, rather than letting an undefined org turn into a 404
 * somewhere in the test.
 *
 * @param {string} family Family name, for the error message.
 * @param {{[environment: string]: {[key: string]: string}}} defaults
 * Per-environment defaults, keyed by the value of `ENVIRONMENT`.
 * @param {{[key: string]: string}} overrides Env var name per configuration key.
 * Every key listed here is required.
 * @returns {{[key: string]: string}} The resolved configuration.
 */
export function getSmokeConfiguration(family, defaults, overrides) {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const environmentDefaults = defaults[__ENV.ENVIRONMENT] ?? {};

    /** @type {{[key: string]: string}} */
    const configuration = {};
    /** @type {string[]} */
    const missing = [];

    for (const [key, variable] of Object.entries(overrides)) {
        const value = __ENV[variable] || environmentDefaults[key];

        if (value === undefined || value === "") {
            missing.push(`${key} (set ${variable})`);
        } else {
            configuration[key] = value;
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing ${family} smoke test configuration for ${__ENV.ENVIRONMENT}: ${missing.join(", ")}`,
        );
    }

    return configuration;
}

/**
 * Builds a token generator for a service owner.
 *
 * @param {string} org Service owner org code, e.g. `ttd`.
 * @param {string[]} scopes Scopes the token needs.
 * @param {string|null} [orgNo] Organisation number, when the API checks it.
 * @returns {EnterpriseTokenGenerator} Generator for the service owner's tokens.
 */
export function getServiceOwnerTokenGenerator(org, scopes, orgNo = null) {
    const builder = new EnterpriseTokenBuilder()
        .withOrganization(org)
        .withScopes(CreateScopeString(scopes));

    if (orgNo !== null) {
        builder.withOrganizationNumber(orgNo);
    }

    return new EnterpriseTokenGenerator(builder.build());
}

/**
 * The identity of an end user a smoke test acts as.
 *
 * @typedef {object} SmokeEndUser
 * @property {string} [pid] National identity number.
 * @property {string} [userId] Altinn user id.
 * @property {string} [partyId] Altinn party id.
 * @property {string} [partyUuid] Altinn party UUID.
 */

/**
 * Builds a token generator for an end user.
 *
 * Only the identity fields the caller has are put on the token, since the
 * APIs differ in which claims they resolve the user from.
 *
 * @param {SmokeEndUser} user The end user.
 * @param {string[]} scopes Scopes the token needs.
 * @returns {PersonalTokenGenerator} Generator for the end user's tokens.
 */
export function getEndUserTokenGenerator(user, scopes) {
    const builder = new PersonalTokenBuilder().withScopes(CreateScopeString(scopes));

    if (user.pid !== undefined) {
        builder.withPid(user.pid);
    }

    if (user.userId !== undefined) {
        builder.withUserId(user.userId);
    }

    if (user.partyId !== undefined) {
        builder.withPartyId(user.partyId);
    }

    if (user.partyUuid !== undefined) {
        builder.withPartyUuid(user.partyUuid);
    }

    return new PersonalTokenGenerator(builder.build());
}
