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
 * K6/testdata/authentication/consent/request-events/
 *   - consentee-orgs/<env>.csv       (header: orgNo)
 *   - consenter-persons/<env>.csv    (header: ssn,userId,partyUuid)
 */

// TODO: switch the ref back to "refs/heads/main" before merging. It currently
// points at the feature branch so the new test data resolves before the merge.
const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/consent/events-improvement/K6/testdata/authentication/consent/request-events";

/**
 * The organizations that receive (and therefore hold) consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{orgNo: string}>}
 */
export function getConsenteeOrgs(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consentee-orgs/${env}.csv`);
    return parseCsvData(res.body);
}

/**
 * The persons that approve consents.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{ssn: string, userId: string, partyUuid: string}>}
 */
export function getConsenterPersons(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consenter-persons/${env}.csv`);
    return parseCsvData(res.body);
}

/**
 * Token options for a consentee organization (enterprise token).
 * @param {string} orgNo
 * @param {string} scopes e.g. "altinn:consentrequests.read".
 * @returns {Map<string, string|number>}
 */
export function getConsenteeTokenOpts(orgNo, scopes) {
    const opts = new Map();
    opts.set("env", __ENV.ENVIRONMENT);
    opts.set("ttl", 3600);
    opts.set("scopes", scopes);
    opts.set("orgNo", orgNo);
    return opts;
}

/**
 * Token options for a consenter person (personal token).
 * @param {string} userId
 * @param {string} partyUuid
 * @returns {Map<string, string|number>}
 */
export function getConsenterTokenOpts(userId, partyUuid) {
    const opts = new Map();
    opts.set("env", __ENV.ENVIRONMENT);
    opts.set("ttl", 3600);
    opts.set("scopes", "altinn:portal/enduser");
    opts.set("userId", userId);
    opts.set("partyuuid", partyUuid);
    return opts;
}
