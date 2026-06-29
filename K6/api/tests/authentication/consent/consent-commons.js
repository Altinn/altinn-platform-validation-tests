import http from "k6/http";
import {
    EnterpriseTokenGeneratorOptions,
    PersonalTokenGeneratorOptions,
} from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { ENDUSER_SCOPE } from "../../../../scopes.js";

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
 *   - lookup/<env>.csv               (header: Pid,Org,ConsentId)
 */

// Git ref the test data is fetched from. Defaults to main; callers can pass an
// explicit ref (e.g. a feature branch whose CSVs aren't merged yet), or set
// TESTDATA_REF to override the default globally.
const DEFAULT_TESTDATA_REF = __ENV.TESTDATA_REF || "main";

/** Builds a test data CSV URL for a given ref, optionally under a subfolder. */
function testdataUrl(category, env, subfolder = "", ref = DEFAULT_TESTDATA_REF) {
    const base = `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${ref}/K6/testdata/authentication/consent`;
    const seg = subfolder ? `${subfolder}/` : "";
    return `${base}/${seg}${category}/${env}.csv`;
}

/**
 * The organizations that receive (and therefore hold) consents.
 * @param {string} env Environment, e.g. "yt01".
 * @param {string} subfolder Optional subfolder, e.g. "two-resources".
 * @param {string} ref Optional git ref to fetch from (default: main / TESTDATA_REF).
 * @returns {Array<{orgNo: string}>}
 */
export function getConsenteeOrgs(env, subfolder = "", ref = DEFAULT_TESTDATA_REF) {
    const res = http.get(testdataUrl("consentee-orgs", env, subfolder, ref), {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * The persons that approve consents.
 * @param {string} env Environment, e.g. "yt01".
 * @param {string} subfolder Optional subfolder, e.g. "two-resources".
 * @param {string} ref Optional git ref to fetch from (default: main / TESTDATA_REF).
 * @returns {Array<{ssn: string, partyUuid: string}>}
 */
export function getConsenterPersons(env, subfolder = "", ref = DEFAULT_TESTDATA_REF) {
    const res = http.get(testdataUrl("consenter-persons", env, subfolder, ref), {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * Previously generated consents (by consent-data.js) to look up.
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{Pid: string, Org: string, ConsentId: string}>}
 */
export function getLookupConsents(env) {
    const res = http.get(testdataUrl("lookup", env), {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * Base enterprise (org) token options: env, ttl and scopes, no identity. Used
 * to build the generator once; orgNo is set per iteration.
 * @param {string} env
 * @param {string} scopes
 * @returns {EnterpriseTokenGeneratorOptions}
 */
export function getEnterpriseBaseTokenOpts(env, scopes) {
    return new EnterpriseTokenGeneratorOptions([
        ["env", env],
        ["ttl", 3600],
        ["scopes", scopes],
    ]);
}

/**
 * Enterprise (org) token options for a given org and scope. Set per iteration
 * via setTokenGeneratorOptions.
 * @param {string} env
 * @param {string} orgNo
 * @param {string} scopes
 * @returns {EnterpriseTokenGeneratorOptions}
 */
export function getEnterpriseTokenOpts(env, orgNo, scopes) {
    const opts = getEnterpriseBaseTokenOpts(env, scopes);
    opts.set("orgNo", orgNo);
    return opts;
}

/**
 * Base personal (end user) token options: env, ttl and the enduser scope, no
 * identity. Used to build the generator once; partyuuid is set per iteration.
 * @param {string} env
 * @returns {PersonalTokenGeneratorOptions}
 */
export function getPersonalBaseTokenOpts(env) {
    return new PersonalTokenGeneratorOptions([
        ["env", env],
        ["ttl", 3600],
        ["scopes", ENDUSER_SCOPE],
    ]);
}

/**
 * Personal (end user) token options for a given person. Set per iteration via
 * setTokenGeneratorOptions.
 * @param {string} env
 * @param {string} partyUuid
 * @returns {PersonalTokenGeneratorOptions}
 */
export function getPersonalTokenOpts(env, partyUuid) {
    const opts = getPersonalBaseTokenOpts(env);
    opts.set("partyuuid", partyUuid);
    return opts;
}

/**
 * `validTo` for generated consents. Far in the future so the consents (and the
 * events/lookup data derived from them) don't go stale between test runs.
 * @returns {string} ISO timestamp ~100 years from now.
 */
export function consentValidTo() {
    return new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString();
}
