import http from "k6/http";
import { parseCsvData } from "../../../../helpers.js";

/**
 * Shared helpers for the consent request events tests and their test data
 * generation. The consentee organizations and consenter users are kept in
 * dedicated CSV files (one per environment) so that:
 *   - the test data generator can spread consents across many organizations, and
 *   - consent-request-events.js can pick a random organization from that same list.
 *
 * Test data folder (one folder per use case, one file per environment):
 * K6/testdata/authentication/consent/
 *   - consentee-orgs/<env>.csv       (header: orgNo)
 *   - consenter-persons/<env>.csv    (header: ssn,partyUuid)
 */

const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/consent";

export const ConsentScope = {
    READ: "altinn:consentrequests.read",
    WRITE: "altinn:consentrequests.write",
    // Maskinporten looks up consent before issuing a token (org token).
    LOOKUP: "altinn:maskinporten/consent.read",
};

export const ENDUSER_SCOPE = "altinn:portal/enduser";

/**
 * The organizations that receive (and therefore hold) consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{orgNo: string}>}
 */
export function getConsenteeOrgs(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consentee-orgs/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * The persons that approve consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{ssn: string, partyUuid: string}>}
 */
export function getConsenterPersons(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consenter-persons/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * Token options for a consentee organization (enterprise token).
 * orgNo is optional so the generator can be built once and have its org set
 * per iteration via setTokenGeneratorOptions.
 * @param {string} env
 * @param {string} [orgNo]
 * @param {string} scopes One of {@link ConsentScope}.
 * @returns {Map<string, string|number>}
 */
export function getEnterpriseTokenOpts(env, orgNo, scopes) {
    const opts = getBaseTokenOpts(env, scopes);
    if (orgNo !== undefined) {
        opts.set("orgNo", orgNo);
    }
    return opts;
}

/**
 * Token options for a consenter person (personal token).
 * partyUuid is optional so the generator can be built once and have its
 * identity set per iteration via setTokenGeneratorOptions.
 * @param {string} env
 * @param {string} [partyUuid]
 * @returns {Map<string, string|number>}
 */
export function getPersonalTokenOpts(env, partyUuid) {
    const opts = getBaseTokenOpts(env, ENDUSER_SCOPE);
    if (partyUuid !== undefined) {
        opts.set("partyuuid", partyUuid);
    }
    return opts;
}

/**
 * Static token options shared by every token: env, ttl and scopes. The
 * per-request identity (orgNo / partyuuid) is set per iteration via
 * setTokenGeneratorOptions, so the generator can be built once.
 * @param {string} env
 * @param {string} scopes
 * @returns {Map<string, string|number>}
 */
export function getBaseTokenOpts(env, scopes) {
    return new Map([
        ["env", env],
        ["ttl", 3600],
        ["scopes", scopes],
    ]);
}
