import { AddressVerificationClient } from "../../../clients/profil/address-verification/index.js";
import { ProfessionalNotificationSettingsClient } from "../../../clients/profil/professional-notification-settings/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../common-imports.js";
import { fetchTestData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

/**
 * Shared setup for the profil tests: the test persons, the token they act with
 * and the clients they call through.
 *
 * The profile API writes almost everything under `users/current`, so a test says
 * who it is through the token rather than through a path, and every test here
 * needs the same three things. They live in one place so a new test only has to
 * describe its own flow.
 */

/**
 * @typedef {object} TestPerson
 * @property {string} pid Person identifier of the user.
 * @property {string} userId
 * @property {string} userPartyId Party id of the user itself.
 * @property {string} userPartyUuid Party uuid of the user itself.
 * @property {string} orgNo Organisation number of the avgiver.
 * @property {string} orgPartyId Party id of the avgiver.
 * @property {string} orgPartyUuid Party uuid of the avgiver.
 */

/**
 * @type {ProfessionalNotificationSettingsClient | undefined}
 */
let notificationSettingsClient = undefined;

/**
 * @type {AddressVerificationClient | undefined}
 */
let addressVerificationClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * The persons set up in the given environment.
 *
 * One file per environment, since the ids a person and an organisation have are
 * the environment's own. `orgPartyUuid` is the avgiver, the organisation a setting
 * is stored under, while the user fields are the person the token is minted for.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {TestPerson[]} The persons to draw from.
 */
export function getTestPersons(env) {
    return fetchTestData(`profil/users-and-parties/${env}.csv`);
}

/**
 * Creates and caches the clients, all reading from the same token generator.
 *
 * Built once per VU and reused across its iterations, since the generator caches
 * a token per option set and rebuilding it per iteration refetches every token.
 * The person can differ per iteration, so the options are replaced per iteration
 * instead, in {@link actAs}.
 *
 * @returns {{settings: ProfessionalNotificationSettingsClient, verification: AddressVerificationClient}}
 * The clients the tests call through.
 */
export function getClients() {
    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator();

        notificationSettingsClient = new ProfessionalNotificationSettingsClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );

        addressVerificationClient = new AddressVerificationClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );
    }

    return {
        settings: notificationSettingsClient,
        verification: addressVerificationClient,
    };
}

/**
 * Points the token generator at the given person.
 *
 * The endpoints read the person out of the token and write under `users/current`,
 * so the drawn user is what decides whose profile is touched. Call it before the
 * first request of an iteration, and after {@link getClients}, which is what
 * builds the generator.
 *
 * @param {TestPerson} person - The person to act as.
 */
export function actAs(person) {
    tokenGenerator.setTokenGeneratorOptions(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .withUserId(person.userId)
            .withPid(person.pid)
            .withPartyId(person.userPartyId)
            .build(),
    );
}
