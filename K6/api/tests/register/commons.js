import { fail } from "k6";
import http from "k6/http";

import { EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
} from "../../../common-imports.js";
import { getItemFromList, parseCsvData, retry, fetchTestData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";

/**
 * Test data for the register tests, one file per environment.
 *
 * Read over HTTP from main rather than from disk, so a branch-only edit to a file
 * changes nothing until it is merged.
 *
 * K6/testdata/register/
 * - register-usernames-<env>.csv   (header: username)
 * - organizations-<env>.csv        (header: organizationUuid,organizationId,type)
 */


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
    return fetchTestData(`register/register-usernames-${env}.csv`);
}

/**
 * Organizations that hold an Enhetsregisteret role on behalf of customers, ten
 * per role.
 *
 * `type` is the role the organization holds, and there are only three of them:
 * revisor, regnskapsforer and forretningsforer. Those are the ER roles Altinn
 * turns into a client relationship, where one organization may act for another,
 * so they are the only ones with customers to read. See CcrCustomerRoles.
 *
 * Keeping the role in the row is what lets the test take an organization and the
 * role it plays from the same draw. Every organization was verified to have
 * customers in its environment when the file was generated, since one without
 * customers gives the role test nothing to remove.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {Array<{organizationUuid: string, organizationId: string, type: string}>}
 * The organizations.
 */
export function getOrganizations(env) {
    return fetchTestData(`register/organizations-${env}.csv`);
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
 * getLookupClient. The scope alone is what grants the read, so the token carries no
 * pid: verified against at22, where the same call answers 200 with the scope and no
 * person behind it, and 401 with a platform token that cannot carry the scope at all.
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

/**
 * Organization numbers of the customers that have this organization in the given role.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} organizationUuid The uuid of the organization holding the role.
 * @param {string} ccrRole The role the customers have assigned, e.g. "revisor".
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<string>|null} Organization numbers, or null when the call failed.
 */
export function getCustomerOrganizationNumbers(
    registerClient,
    organizationUuid,
    ccrRole,
    labels = null,
) {
    const customers = RegisterBuildingBlocks.GetCustomers(
        registerClient,
        organizationUuid,
        ccrRole,
        // Only the organization number is compared on, and an organization can have
        // thousands of customers, so ask for as little as possible.
        ["org-id"],
        labels,
    );

    if (customers === null) {
        return null;
    }

    return customers.map((customer) => customer.organizationIdentifier);
}

/**
 * Picks a customer to move in and out of an organization's customer list.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} ccrRole The role under test, e.g. "revisor".
 * @param {{organizationUuid: string, organizationId: string}} organization The organization holding the role.
 * @param {boolean} randomize Whether to draw at random rather than take the first.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string} Organization number of the customer to move.
 */
export function drawCustomerToMove(
    registerClient,
    ccrRole,
    organization,
    randomize,
    labels = null,
) {
    // The customers are organizations, so the organization number is what ER takes
    // and what the assertions compare on.
    const currentOrgs = getCustomerOrganizationNumbers(
        registerClient,
        organization.organizationUuid,
        ccrRole,
        labels,
    );

    if (currentOrgs === null) {
        fail(`cannot continue: reading the ${ccrRole} customers failed`);
    }

    console.log(
        `Initial number of ${ccrRole} customers for ${organization.organizationId}: ${currentOrgs.length}`,
    );

    if (currentOrgs.length === 0) {
        fail(
            `cannot continue: ${organization.organizationId} has no ${ccrRole} customers to test with`,
        );
    }

    // Drawn the same way as the organization, rather than always the first one. Two
    // VUs that draw the same organization would otherwise target the same customer,
    // and each would see the other's removal and add-back as its own.
    const targetOrg = getItemFromList(currentOrgs, randomize);
    console.log(`Picked target client organizationIdentifier: ${targetOrg}`);

    return targetOrg;
}

/**
 * Waits until Register agrees with a change just made in ER.
 *
 * `retry` checks before it sleeps, so a change that has already landed costs
 * nothing, and short intervals only shorten the overshoot. Twenty-four tries five
 * seconds apart is two minutes of headroom for a propagation that normally takes
 * seconds.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} ccrRole The role under test, e.g. "revisor".
 * @param {{organizationUuid: string, organizationId: string}} organization The organization holding the role.
 * @param {string} targetOrg Organization number of the customer being moved.
 * @param {boolean} expectPresent Whether the customer should end up in the list.
 * @param {string} testscenario Prefix used in log and check output.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True once Register agrees, false if it never did.
 */
export function waitForRegister(
    registerClient,
    ccrRole,
    organization,
    targetOrg,
    expectPresent,
    testscenario,
    labels = null,
) {
    return retry(
        () => {
            const orgs = getCustomerOrganizationNumbers(
                registerClient,
                organization.organizationUuid,
                ccrRole,
                labels,
            );

            // A failed read says nothing about the role, so keep waiting rather than
            // read the empty result as the change having gone through.
            if (orgs === null) {
                return false;
            }

            const present = orgs.includes(targetOrg);
            console.log(
                `[${testscenario}] Org ${targetOrg} is ${present ? "" : "not "}in the list (${orgs.length})`,
            );

            return present === expectPresent;
        },
        {
            retries: 24,
            intervalSeconds: 5,
            testscenario: testscenario,
        },
    );
}
