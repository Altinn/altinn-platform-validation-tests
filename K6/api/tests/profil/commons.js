import { fail } from "k6";
import http from "k6/http";

import { AddressVerificationClient } from "../../../clients/profil/address-verification/index.js";
import { ProfessionalNotificationSettingsClient } from "../../../clients/profil/professional-notification-settings/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../common-imports.js";
import { parseCsvData } from "../../../helpers.js";
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
 * Persons the tests act as, and the organisation each one may act for.
 *
 * One row per environment: the same person and the same avgiver everywhere, with
 * the ids each environment gave them. `orgPartyUuid` is the avgiver, the
 * organisation a setting is stored under, while the user fields are the person the
 * token is minted for.
 *
 * Read over http rather than with k6's open(), which the cloud runner cannot use.
 * The read is pinned to main, so an edit to the file takes effect once it is
 * merged; point TESTDATA_REF at a branch to try one out before then.
 */
const TESTDATA_REF = __ENV.TESTDATA_REF ?? "main";

const TESTDATA_URL =
    `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${TESTDATA_REF}/K6/testdata/profil/users-and-parties.csv`;

/**
 * @typedef {object} TestPerson
 * @property {string} env Environment the ids belong to.
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
 * The persons that exist in the given environment.
 *
 * The ids differ per environment, so only the rows for the one under test say
 * anything about a person that is actually there.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {TestPerson[]} The persons to draw from.
 */
export function getTestPersons(env) {
    const res = http.get(TESTDATA_URL, { tags: { action: "fetch-test-data" } });

    if (res.status !== 200) {
        fail(`cannot read test data: ${TESTDATA_URL} answered ${res.status}`);
    }

    const persons = parseCsvData(res.body).filter((row) => row.env === env);

    if (persons.length === 0) {
        fail(`cannot read test data: no rows for ${env} in ${TESTDATA_URL}`);
    }

    return persons;
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
