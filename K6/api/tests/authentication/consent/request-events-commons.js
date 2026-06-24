import http from "k6/http";
import { parseCsvData } from "../../../../helpers.js";

/**
 * Shared helpers for the consent request events tests and their test data
 * generation. The consentee organizations and consenter users are kept in
 * dedicated CSV files (one per environment) so that:
 *   - the test data generator can spread consents across many organizations, and
 *   - consent-request-events.js can pick a random organization from that same list.
 *
 * Test data folder:
 * K6/testdata/authentication/consent/request-events/
 *   - consentee-orgs-<env>.csv   (header: orgNo)
 *   - consenter-users-<env>.csv  (header: ssn,userId,partyUuid)
 */

const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/consent/request-events";

export const ConsentScope = {
    READ: "altinn:consentrequests.read",
    WRITE: "altinn:consentrequests.write",
};

/**
 * The organizations that receive (and therefore hold) consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{orgNo: string}>}
 */
export function getConsenteeOrgs(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consentee-orgs-${env}.csv`);
    return parseCsvData(res.body);
}

/**
 * The people that approve consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{ssn: string, userId: string, partyUuid: string}>}
 */
export function getConsenterUsers(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consenter-users-${env}.csv`);
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
    const opts = new Map([
        ["env", env],
        ["ttl", 3600],
        ["scopes", scopes],
    ]);
    if (orgNo !== undefined) {
        opts.set("orgNo", orgNo);
    }
    return opts;
}

/**
 * Token options for a consenter user (personal token).
 * @param {string} env
 * @param {string} [userId]
 * @param {string} [partyUuid]
 * @returns {Map<string, string|number>}
 */
export function getPersonalTokenOpts(env, userId, partyUuid) {
    const opts = new Map([
        ["env", env],
        ["ttl", 3600],
        ["scopes", "altinn:portal/enduser"],
    ]);
    if (userId !== undefined) {
        opts.set("userId", userId);
    }
    if (partyUuid !== undefined) {
        opts.set("partyuuid", partyUuid);
    }
    return opts;
}
