import { ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../../scopes.js";

const ENDUSER_SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
]);

/**
 * An organization and a person with a role in it, such as its daglig leder or
 * the bostyrer of a konkursbo. Made with testudo, see the README in this
 * folder.
 *
 * @typedef {object} OrganizationRow
 * @property {string} organizationIdentifier Organization number.
 * @property {string} partyUuid Party UUID of the organization.
 * @property {string} personRole The person's role in the organization, for example daglig-leder or bostyrer.
 * @property {string} ssn National identity number of the person.
 * @property {string} userId Altinn user id of the person.
 * @property {string} userPartyId Party id of the person.
 * @property {string} userPartyUuid Party UUID of the person.
 */

/**
 * Reads one fixture in this folder for the environment.
 *
 * @param {string} fixture The fixture's folder under delegation-check, for example organizations.
 * @returns {Array<OrganizationRow>} The rows.
 */
function loadFixture(fixture) {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return fetchTestData(`access-management/enduser/connections/delegation-check/${fixture}/${__ENV.ENVIRONMENT}.csv`);
}

/**
 * Setup for the tests that act as the daglig leder of an AS.
 *
 * @returns {{organizations: Array<OrganizationRow>}} AS organizations with their daglig leder.
 */
export function setupOrganizations() {
    return { organizations: loadFixture("organizations") };
}

/**
 * Setup for the tests that act as the bostyrer of a konkursbo.
 *
 * @returns {{konkursbo: Array<OrganizationRow>}} Konkursbo with their bostyrer.
 */
export function setupKonkursbo() {
    return { konkursbo: loadFixture("konkursbo") };
}

/**
 * Creates the client and its token generator once per k6 runtime, for nobody
 * in particular. Which end user an iteration acts as is set per row with
 * setTokenGeneratorOptions and getPersonTokenOpts.
 *
 * @returns {{connections: ConnectionsClient, tokenGenerator: PersonalTokenGenerator}} The client and its token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withScopes(ENDUSER_SCOPES)
            .build(),
    );

    return {
        connections: new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * Token options for acting as the person in a row. The scopes are repeated,
 * since the options replace the ones the generator was built with.
 *
 * @param {OrganizationRow} row The row whose person the iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getPersonTokenOpts(row) {
    return new PersonalTokenBuilder()
        .withScopes(ENDUSER_SCOPES)
        .withUserId(row.userId)
        .withPartyId(row.userPartyId)
        .withPartyUuid(row.userPartyUuid)
        .withPid(row.ssn)
        .build();
}
