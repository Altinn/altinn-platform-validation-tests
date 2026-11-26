import { AuthorizedPartiesClient } from "../../../../../clients/access-management/enduser/authorized-parties/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

const AUTHORIZED_PARTIES_SCOPES = CreateScopeString([
    AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT,
]);

/**
 * An ADOS unit (administrativ enhet - offentlig sektor), the hovedenhet it
 * belongs to and the daglig leder of that hovedenhet. Made with testudo, see
 * the README in this folder.
 *
 * @typedef {object} AdosSubunitRow
 * @property {string} organizationIdentifier Organization number of the ADOS unit.
 * @property {string} partyUuid Party UUID of the ADOS unit.
 * @property {string} hovedenhetOrganizationIdentifier Organization number of the hovedenhet.
 * @property {string} hovedenhetPartyUuid Party UUID of the hovedenhet.
 * @property {string} hovedenhetUnitType Unit type of the hovedenhet, for example KOMM.
 * @property {string} ssn National identity number of the daglig leder of the hovedenhet.
 * @property {string} userId Altinn user id of the daglig leder.
 * @property {string} userPartyId Party id of the daglig leder.
 * @property {string} userPartyUuid Party UUID of the daglig leder.
 */

/** @type {PersonalTokenGenerator|null} */
let tokenGenerator = null;

/** @type {AuthorizedPartiesClient|null} */
let authorizedPartiesClient = null;

/**
 * Creates and caches the client this test folder uses.
 *
 * @param {string} userId Altinn user id of the end user.
 * @param {string} partyId Altinn party id of that user.
 * @param {string} partyUuid Party UUID of that user.
 * @param {string} pid Person identifier of that user.
 * @returns {[AuthorizedPartiesClient]} The client, as a single item list.
 */
export function getClients(userId, partyId, partyUuid, pid) {

    if (tokenGenerator == null || authorizedPartiesClient == null) {
        const options = new PersonalTokenBuilder()
            .withScopes(AUTHORIZED_PARTIES_SCOPES)
            .withUserId(userId)
            .withPartyId(partyId)
            .withPartyUuid(partyUuid)
            .withPid(pid)
            .build();

        tokenGenerator
            = new PersonalTokenGenerator(options);
        authorizedPartiesClient
            = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [authorizedPartiesClient];
}

/**
 * Creates the client and its token generator once per k6 runtime, for nobody
 * in particular. Which end user an iteration acts as is set per row with
 * setTokenGeneratorOptions and getDagligLederTokenOpts.
 *
 * @returns {{authorizedParties: AuthorizedPartiesClient, tokenGenerator: PersonalTokenGenerator}} The client and its token generator.
 */
export const getAuthorizedPartiesClient = lazy(function () {
    const generator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withScopes(AUTHORIZED_PARTIES_SCOPES)
            .build(),
    );

    return {
        authorizedParties: new AuthorizedPartiesClient(__ENV.BASE_URL, generator),
        tokenGenerator: generator,
    };
});

/**
 * Token options for acting as the daglig leder in a row. The scopes are
 * repeated, since the options replace the ones the generator was built with.
 *
 * @param {AdosSubunitRow} row The row whose daglig leder the iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getDagligLederTokenOpts(row) {
    return new PersonalTokenBuilder()
        .withScopes(AUTHORIZED_PARTIES_SCOPES)
        .withUserId(row.userId)
        .withPartyId(row.userPartyId)
        .withPartyUuid(row.userPartyUuid)
        .withPid(row.ssn)
        .build();
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const testdata = fetchTestData(`access-management/enduser/testdata-${__ENV.ENVIRONMENT}.json`);
    const sharedTestData = fetchTestData("access-management/enduser/shared-testdata.json");

    /** @type {Array<AdosSubunitRow>} */
    const adosSubunits = fetchTestData(`access-management/enduser/authorized-parties/ados-subunits/${__ENV.ENVIRONMENT}.csv`);

    return {
        testdata, sharedTestData, adosSubunits
    };
}
