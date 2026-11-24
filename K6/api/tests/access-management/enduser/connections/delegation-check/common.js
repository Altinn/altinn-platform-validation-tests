import { ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../../scopes.js";

const ENDUSER_SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
]);

/**
 * An organization and its daglig leder. Made with testudo, see the README in
 * this folder.
 *
 * @typedef {object} OrganizationRow
 * @property {string} organizationIdentifier Organization number.
 * @property {string} partyUuid Party UUID of the organization.
 * @property {string} personRole The person's role in the organization, daglig-leder.
 * @property {string} ssn National identity number of the daglig leder.
 * @property {string} userId Altinn user id of the daglig leder.
 * @property {string} userPartyId Party id of the daglig leder.
 * @property {string} userPartyUuid Party UUID of the daglig leder.
 */

/**
 * Loads the test data the tests in this folder draw from.
 *
 * @returns {{organizations: Array<OrganizationRow>}} Environment-specific test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        organizations: fetchTestData(`access-management/enduser/connections/delegation-check/organizations/${__ENV.ENVIRONMENT}.csv`),
    };
}

/**
 * Creates the client and its token generator once per k6 runtime, for nobody
 * in particular. Which end user an iteration acts as is set per row with
 * setTokenGeneratorOptions and getDagligLederTokenOpts.
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
 * Token options for acting as the daglig leder in a row. The scopes are
 * repeated, since the options replace the ones the generator was built with.
 *
 * @param {OrganizationRow} row The row whose daglig leder the iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getDagligLederTokenOpts(row) {
    return new PersonalTokenBuilder()
        .withScopes(ENDUSER_SCOPES)
        .withUserId(row.userId)
        .withPartyId(row.userPartyId)
        .withPartyUuid(row.userPartyUuid)
        .withPid(row.ssn)
        .build();
}
