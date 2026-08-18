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
 * One file per environment, since the ids a person and an organisation have are
 * the environment's own. `orgPartyUuid` is the avgiver, the organisation a setting
 * is stored under, while the user fields are the person the token is minted for.
 *
 * Read over http rather than with k6's open(), which the cloud runner cannot use.
 * The read is pinned to main, so an edit to the file takes effect once it is
 * merged; point TESTDATA_REF at a branch to try one out before then.
 */
const TESTDATA_REF = __ENV.TESTDATA_REF ?? "main";

const TESTDATA_BASE_URL =
    `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${TESTDATA_REF}/K6/testdata/profil`;

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
 * An environment with no file of its own, and a file that was renamed on a branch
 * while the read is pinned to main, both answer 404. Either way the failure names
 * the url that came up short, since an empty list would otherwise only surface
 * later as an undefined person somewhere in a test.
 *
 * @param {string} env - Environment, e.g. "tt02".
 * @returns {TestPerson[]} The persons to draw from.
 */
export function getTestPersons(env) {
    const url = `${TESTDATA_BASE_URL}/users-and-parties-${env}.csv`;

    const res = http.get(url, { tags: { action: "fetch-test-data" } });

    if (res.status !== 200) {
        fail(`cannot read test data: ${url} answered ${res.status}`);
    }

    const persons = parseCsvData(res.body);

    if (persons.length === 0) {
        fail(`cannot read test data: ${url} holds no rows`);
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
