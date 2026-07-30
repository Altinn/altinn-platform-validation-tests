import http from "k6/http";

import { CreateScopeString, PORTAL_ENDUSER_SCOPE } from "../../../../../scopes.js";
import {
    EnterpriseTokenBuilder,
    PersonalTokenBuilder,
} from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";

/**
 * Shared helpers for the consent request events tests and their test data
 * generation. The consentee organizations and consenter users are kept in
 * dedicated CSV files (one per environment) so that:
 * - the test data generator can spread consents across many organizations, and
 * - consent-request-events.js can pick a random organization from that same list.
 *
 * Test data folder (one folder per use case, one file per environment):
 * K6/testdata/authentication/consent/
 * - consentee-orgs/<env>.csv       (header: orgNo)
 * - consenter-persons/<env>.csv    (header: ssn,partyUuid)
 * - lookup/<env>.csv               (header: Pid,Org,ConsentId)
 */

const TESTDATA_BASE_URL =
    "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/consent";

/**
 * The organizations that receive (and therefore hold) consents.
 *
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{orgNo: string}>} TODO: description
 */
export function getConsenteeOrgs(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consentee-orgs/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * The persons that approve consents.
 *
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{ssn: string, partyUuid: string}>} TODO: description
 */
export function getConsenterPersons(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/consenter-persons/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * Previously generated consents (by consent-data.js) to look up.
 *
 * @param {string} env Environment, e.g. "yt01".
 * @returns {Array<{Pid: string, Org: string, ConsentId: string}>} TODO: description
 */
export function getLookupConsents(env) {
    const res = http.get(`${TESTDATA_BASE_URL}/lookup/${env}.csv`, {
        tags: { action: "fetch-test-data" },
    });
    return parseCsvData(res.body);
}

/**
 * Base enterprise (org) token options: env, ttl and scopes, no identity. Used
 * to build the generator once; orgNo is set per iteration.
 *
 * @param {string} env TODO: description
 * @param {string} scopes TODO: description
 * @returns {object} TODO: description
 */
export function getEnterpriseBaseTokenOpts(env, scopes) {
    return new EnterpriseTokenBuilder()
        .withEnvironment(env)
        .withTtl(3600)
        .withScopes(scopes)
        .build();
}

/**
 * Enterprise (org) token options for a given org and scope. Set per iteration
 * via setTokenGeneratorOptions.
 *
 * @param {string} env TODO: description
 * @param {string} orgNo TODO: description
 * @param {string} scopes TODO: description
 * @returns {object} Built enterprise token options.
 */
export function getEnterpriseTokenOpts(env, orgNo, scopes) {
    return new EnterpriseTokenBuilder()
        .withEnvironment(env)
        .withTtl(3600)
        .withScopes(scopes)
        .withOrganizationNumber(orgNo)
        .build();
}

/**
 * Base personal (end user) token options: env, ttl and the enduser scope, no
 * identity. Used to build the generator once; partyuuid is set per iteration.
 *
 * @param {string} env TODO: description
 * @returns {object} TODO: description
 */
export function getPersonalBaseTokenOpts(env) {
    const scopes = CreateScopeString([
        PORTAL_ENDUSER_SCOPE
    ]);
    return new PersonalTokenBuilder()
        .withEnvironment(env)
        .withTtl(3600)
        .withScopes(scopes)
        .build();
}

/**
 * Personal (end user) token options for a given person. Set per iteration via
 * setTokenGeneratorOptions.
 *
 * @param {string} env TODO: description
 * @param {string} partyUuid TODO: description
 * @returns {object} Built personal token options.
 */
export function getPersonalTokenOpts(env, partyUuid) {
    const scopes = CreateScopeString([
        PORTAL_ENDUSER_SCOPE
    ]);
    return new PersonalTokenBuilder()
        .withEnvironment(env)
        .withTtl(3600)
        .withScopes(scopes)
        .withPartyUuid(partyUuid)
        .build();
}

/**
 * `validTo` for generated consents. Far in the future so the consents (and the
 * events/lookup data derived from them) don't go stale between test runs.
 *
 * @returns {string} ISO timestamp ~100 years from now.
 */
export function consentValidTo() {
    return new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString();
}
