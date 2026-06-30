
import http from "k6/http";

import { BffAccessManagementApiClient, BffAccessPackageApiClient, BffConnectionsApiClient, BffUserApiClient } from "../../../../../clients/authentication/index.js";
import { GraphqlClient } from "../../../../../clients/dialogporten/graphql/index.js";
import { ServiceOwnerApiClient } from "../../../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenGenerator, EnterpriseTokenGeneratorOptions, PersonalTokenGenerator, PersonalTokenGeneratorOptions } from "../../../../../common-imports.js";
import { getItemFromList, getNumberOfVUs, parseCsvData, pickUnique, requireEnv, segmentData } from "../../../../../helpers.js";

export const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

// All apiclient used in this test
/** @type {ServiceOwnerApiClient | undefined} */
let serviceOwnerApiClient = undefined;
/** @type {BffUserApiClient | undefined} */
let userApiClient = undefined;
/** @type {BffAccessManagementApiClient | undefined} */
let accessManagementApiClient = undefined;
/** @type {BffConnectionsApiClient | undefined} */
let bffConnectionsApiClient = undefined;
/** @type {BffAccessPackageApiClient | undefined} */
let bffAccessPackageApiClient = undefined;
/** @type {GraphqlClient | undefined} */
let graphqlClient = undefined;
/** @type {PersonalTokenGenerator | undefined} */
let personalTokenGenerator = undefined;

/**
 * Creates and caches the API clients used by the test.
 *
 * The service owner client uses an enterprise token scoped to the provided
 * organization number, while the remaining clients share a single personal
 * token generator.
 *
 * Existing client instances are reused on subsequent calls.
 *
 * @param {string} serviceOwnerOrgNo - Organization number used when generating the enterprise token.
 * @returns {[
 *   ServiceOwnerApiClient,
 *   BffUserApiClient,
 *   BffAccessManagementApiClient,
 *   BffConnectionsApiClient,
 *   BffAccessPackageApiClient,
 *   GraphqlClient,
 *   PersonalTokenGenerator
 * ]} The initialized API clients and shared personal token generator.
 */
export function getClients(serviceOwnerOrgNo) {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new EnterpriseTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider");
        tokenOpts.set("org", "ttd");
        tokenOpts.set("orgNo", serviceOwnerOrgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (userApiClient == undefined) {
        const tokenOpts = new PersonalTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        userApiClient = new BffUserApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        accessManagementApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffConnectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffAccessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        graphqlClient = new GraphqlClient(__ENV.BASE_URL, personalTokenGenerator);
    }
    return [
        serviceOwnerApiClient,
        userApiClient,
        accessManagementApiClient,
        bffConnectionsApiClient,
        bffAccessPackageApiClient,
        graphqlClient,
        personalTokenGenerator
    ];
}

export function getTokenOpts(userId, partyuuid) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    tokenOpts.set("userId", userId);
    tokenOpts.set("partyuuid", partyuuid);
    return tokenOpts;
}

/**
 * Helper function to get from and to organizations/users for the current iteration, ensuring that they are not the same
 * @returns object with from and to organizations
 */
export function getFromTo(list) {
    const [from, to] = pickUnique(list, 2);
    return { from, to };
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL", "BASE_URL"]);

    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

export function getDialogportenOpts(ssn) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten");
    tokenOpts.set("pid", ssn);
    return tokenOpts;
}

/**
 * Helper function to create the body for delegating rights for a resource and instance to another user,
 * based on the rights meta for the resource and the "to" user.
 * @param { JSON } rightsMeta
 * @param {*} to
 * @returns
 */
export function getInstanceDelegationBody(rightsMeta, to) {
    return {
        to: {
            personIdentifier: to.ssn,
            lastName: to.lastName,
        },
        directRightKeys: rightsMeta.map((right) => right.key),
    };
}
