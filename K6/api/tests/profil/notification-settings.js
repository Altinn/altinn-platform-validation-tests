import { check, fail, group } from "k6";
import http from "k6/http";

import {
    AddressVerificationClient,
    AddressVerificationRequestBuilder,
} from "../../../clients/profil/address-verification/index.js";
import { ProfessionalNotificationSettingsClient } from "../../../clients/profil/professional-notification-settings/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../common-imports.js";
import { getItemFromList, getOptions, parseCsvData, requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    GetVerifiedAddresses,
    VerifyAddress,
} from "../../building-blocks/profil/address-verification/index.js";
import {
    CreateOrUpdateNotificationSettings,
    DeleteNotificationSettings,
    GetNotificationSettings,
} from "../../building-blocks/profil/professional-notification-settings/index.js";

/**
 * Port of the notification settings test in altinn-profile:
 * test/k6/src/tests/notification-settings.js
 *
 * The professional notification settings are the addresses a person asks to be
 * notified on when acting for one particular organisation, so every call is made
 * as a person, with a party uuid naming the organisation the setting belongs to.
 */

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const label = { step: "test-professional-notification-settings" };

export const options = getOptions([label]);

/**
 * The addresses the test writes and then removes again.
 *
 * The phone number is one of the reserved test numbers, so no message ever
 * reaches a person, and the resource is a placeholder: the include list is stored
 * as given and is not checked against the resource registry.
 */
const NOTIFICATION_SETTINGS = {
    emailAddress: "noreply-1@altinn.no",
    phoneNumber: "+4799999997",
    resourceIncludeList: ["urn:altinn:resource:example"],
};

/**
 * The persons the test acts as, and the organisation each one acts for.
 *
 * One row per environment: the same person and the same avgiver everywhere, with
 * the ids each environment gave them. `orgPartyUuid` is the avgiver, the
 * organisation the setting is stored under, while the user fields are the person
 * the token is minted for.
 *
 * Read over http rather than with k6's open(), which the cloud runner cannot use.
 * The read is pinned to main, so an edit to the file takes effect once it is
 * merged; point TESTDATA_REF at a branch to try one out before then.
 */
const TESTDATA_REF = __ENV.TESTDATA_REF ?? "main";

const TESTDATA_URL =
    `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${TESTDATA_REF}/K6/testdata/profil/notification-settings-users-and-parties.csv`;

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
 * Creates and caches the clients, both reading from the same token generator.
 *
 * Built once per VU and reused across its iterations, since the generator caches
 * a token per option set and rebuilding it per iteration refetches every token.
 * The person differs per iteration, so the options are replaced per iteration
 * instead, in {@link actAs}.
 *
 * @returns {{settings: ProfessionalNotificationSettingsClient, verification: AddressVerificationClient}}
 * The clients the test calls through.
 */
function getClients() {
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
 * Points the token generator at the person of this iteration.
 *
 * The endpoints all read the person out of the token and write under
 * `users/current`, so the drawn user is what decides whose settings are touched.
 *
 * @param {{pid: string, userId: string, userPartyId: string}} person - The person to act as.
 */
function actAs(person) {
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

/**
 * Sends a verification code the address never got and expects it to be refused.
 *
 * The code is made up, so the only answers that say the endpoint is working are
 * 422, the code being wrong, and 429, too many attempts made on the address
 * already. A 204 would mean a wrong code was accepted.
 *
 * @param {AddressVerificationClient} verificationClient - Client for the Address Verification API.
 */
function tryVerifyWithWrongCode(verificationClient) {
    const request = new AddressVerificationRequestBuilder()
        .withValue(NOTIFICATION_SETTINGS.phoneNumber)
        .withType("Sms")
        .withVerificationCode("123456")
        .build();

    VerifyAddress(verificationClient, request, [422], label);
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "TOKEN_GENERATOR_USERNAME", "TOKEN_GENERATOR_PASSWORD"]);

    const res = http.get(TESTDATA_URL, { tags: { action: "fetch-test-data" } });

    if (res.status !== 200) {
        fail(`cannot read test data: ${TESTDATA_URL} answered ${res.status}`);
    }

    // The ids differ per environment, so only the rows for the one under test say
    // anything about a person that exists there.
    const persons = parseCsvData(res.body)
        .filter((row) => row.env === __ENV.ENVIRONMENT);

    if (persons.length === 0) {
        fail(`cannot read test data: no rows for ${__ENV.ENVIRONMENT} in ${TESTDATA_URL}`);
    }

    return persons;
}

export default function (persons) {
    const clients = getClients();
    const person = getItemFromList(persons, randomize);

    actAs(person);

    group("Professional notification settings for a party", () => {
        const created =
            CreateOrUpdateNotificationSettings(
                clients.settings,
                person.orgPartyUuid,
                NOTIFICATION_SETTINGS,
                label,
            );

        if (!created) {
            fail("cannot continue: writing the notification settings failed");
        }

        const settings =
            GetNotificationSettings(
                clients.settings,
                person.orgPartyUuid,
                label,
            );

        if (settings === null) {
            fail("cannot continue: reading the notification settings failed");
        }

        check(settings, {
            "GetNotificationSettings - holds the email that was written": (s) =>
                s.emailAddress === NOTIFICATION_SETTINGS.emailAddress,
            "GetNotificationSettings - holds the phone number that was written": (s) =>
                s.phoneNumber === NOTIFICATION_SETTINGS.phoneNumber,
            "GetNotificationSettings - is for the party it was written for": (s) =>
                s.partyUuid === person.orgPartyUuid,
        });

        GetVerifiedAddresses(
            clients.verification,
            label,
        );

        tryVerifyWithWrongCode(clients.verification);

        // Removes what this iteration wrote, so the person is left as it was found
        // and the next run writes into an empty setting rather than over its own.
        DeleteNotificationSettings(
            clients.settings,
            person.orgPartyUuid,
            label,
        );
    });
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
