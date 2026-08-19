import { fail, group } from "k6";

import {
    AddressVerificationClient,
    AddressVerificationRequestBuilder,
} from "../../../clients/profil/address-verification/index.js";
import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import {
    GetVerifiedAddresses,
    VerifyAddress,
} from "../../building-blocks/profil/address-verification/index.js";
import {
    CreateOrUpdateNotificationSettings,
    DeleteNotificationSettings,
    GetNotificationSettings,
} from "../../building-blocks/profil/professional-notification-settings/index.js";
import { AddressVerificationDomainChecks } from "../../domain-checks/profil/address-verification.js";
import { NotificationSettingsDomainChecks } from "../../domain-checks/profil/notification-settings.js";
import { actAs, getClients, getTestPersons } from "./commons.js";

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

    VerifyAddress(verificationClient, request, [422, 429], label);
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "TOKEN_GENERATOR_USERNAME", "TOKEN_GENERATOR_PASSWORD"]);

    return getTestPersons(__ENV.ENVIRONMENT);
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

        NotificationSettingsDomainChecks.CheckSettingsMatchRequest(
            settings,
            NOTIFICATION_SETTINGS,
            person.orgPartyUuid,
        );

        NotificationSettingsDomainChecks.CheckSettingsBelongToUser(
            settings,
            person.userId,
        );

        NotificationSettingsDomainChecks.CheckAddressesCarryVerificationStatus(settings);

        const verifiedAddresses = GetVerifiedAddresses(
            clients.verification,
            label,
        );

        AddressVerificationDomainChecks.CheckVerifiedAddressesAreTyped(verifiedAddresses);

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
