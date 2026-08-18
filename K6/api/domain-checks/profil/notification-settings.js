import { check } from "k6";

/**
 * The verification statuses the API can report for an address that is set.
 *
 * Legacy is an address carried over from before verification existed, so it is
 * neither verified nor waiting to be. Verified and Unverified are the two states an
 * address written since then can be in.
 */
const VERIFICATION_TYPES = ["Legacy", "Verified", "Unverified"];

/**
 * Checks that the settings read back are the ones that were written.
 *
 * The include list is compared as a set, since the API stores the resources rather
 * than the order they arrived in, and a request that leaves a field out is not
 * asserted on: only what the caller asked for can be expected back.
 *
 * @param {NotificationSettingsResponse} settings - What the read returned.
 * @param {NotificationSettingsRequest} request - What was written.
 * @param {string} expectedPartyUuid - The party the settings were written for.
 * @returns {boolean} True if the settings match, false otherwise.
 */
function CheckSettingsMatchRequest(settings, request, expectedPartyUuid) {
    const success = check(settings, {
        "CheckSettingsMatchRequest - Settings are for the party they were written for": (s) =>
            s?.partyUuid === expectedPartyUuid,
        "CheckSettingsMatchRequest - Email address is the one that was written": (s) =>
            request.emailAddress === undefined ||
            s?.emailAddress === request.emailAddress,
        "CheckSettingsMatchRequest - Phone number is the one that was written": (s) =>
            request.phoneNumber === undefined ||
            s?.phoneNumber === request.phoneNumber,
        "CheckSettingsMatchRequest - Include list holds the resources that were written": (s) =>
            request.resourceIncludeList === undefined ||
            (Array.isArray(s?.resourceIncludeList) &&
                s.resourceIncludeList.length === request.resourceIncludeList.length &&
                request.resourceIncludeList.every((resource) =>
                    s.resourceIncludeList.includes(resource),
                )),
    });

    if (!success) {
        console.error(
            `CheckSettingsMatchRequest - wrote ${JSON.stringify(request)} for party '${expectedPartyUuid}'`,
        );
        console.error(
            `CheckSettingsMatchRequest - settings returned: ${JSON.stringify(settings)}`,
        );
    }

    return success;
}

/**
 * Checks that the settings belong to the person that wrote them.
 *
 * Everything here is written under `users/current`, so the person comes out of the
 * token and never off the path. The user id in the answer is what says the settings
 * that came back are the caller's own and not another person's.
 *
 * @param {NotificationSettingsResponse} settings - What the read returned.
 * @param {string} expectedUserId - User id of the person that wrote them.
 * @returns {boolean} True if the settings belong to the person, false otherwise.
 */
function CheckSettingsBelongToUser(settings, expectedUserId) {
    const success = check(settings, {
        "CheckSettingsBelongToUser - Settings belong to the person that wrote them": (s) =>
            String(s?.userId) === String(expectedUserId),
    });

    if (!success) {
        console.error(
            `CheckSettingsBelongToUser - expected user id '${expectedUserId}', got '${settings?.userId}'`,
        );
    }

    return success;
}

/**
 * Checks that every address that is set carries a verification status.
 *
 * The status is null only when the address itself is unset, so an address with no
 * status is the API having lost track of whether it may be notified on. Which of
 * the three states it is in is deliberately not asserted: an address a person has
 * verified before stays verified across a rewrite.
 *
 * @param {NotificationSettingsResponse} settings - What the read returned.
 * @returns {boolean} True if the statuses are set, false otherwise.
 */
function CheckAddressesCarryVerificationStatus(settings) {
    const success = check(settings, {
        "CheckAddressesCarryVerificationStatus - Email has a verification status": (s) =>
            !s?.emailAddress || VERIFICATION_TYPES.includes(s?.emailVerificationStatus),
        "CheckAddressesCarryVerificationStatus - Phone number has a verification status": (s) =>
            !s?.phoneNumber || VERIFICATION_TYPES.includes(s?.smsVerificationStatus),
    });

    if (!success) {
        console.error(
            `CheckAddressesCarryVerificationStatus - email '${settings?.emailAddress}' is '${settings?.emailVerificationStatus}', phone '${settings?.phoneNumber}' is '${settings?.smsVerificationStatus}'`,
        );
    }

    return success;
}

export const NotificationSettingsDomainChecks = {
    CheckSettingsMatchRequest,
    CheckSettingsBelongToUser,
    CheckAddressesCarryVerificationStatus,
};
