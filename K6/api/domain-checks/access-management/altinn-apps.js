import { check } from "k6";

import {
    AppsInstanceDelegationResponseDtoPaginated,
    ResourceRightDelegationCheckResultDtoPaginated,
} from "../../../clients/access-management/altinn-apps/altinn-apps.types.js";

/**
 * Checks that a delegation check hands out the rights it is expected to, and that
 * every one of them is delegable.
 *
 * @param {ResourceRightDelegationCheckResultDtoPaginated|null} delegationCheck - The delegation check result.
 * @param {string[]} expectedRightKeys - The right keys expected to come back as Delegable.
 * @returns {boolean} True if every expected right is present and Delegable, false otherwise.
 */
function CheckDelegableRights(delegationCheck, expectedRightKeys) {
    const rights = delegationCheck?.data ?? [];

    const success = check(delegationCheck, {
        "CheckDelegableRights - Delegation check returns rights": () => rights.length > 0,
        "CheckDelegableRights - Every expected right is Delegable": () =>
            expectedRightKeys.every((rightKey) =>
                rights.some(
                    (right) => right.rightKey === rightKey && right.status === "Delegable",
                ),
            ),
    });

    if (!success) {
        console.error(`CheckDelegableRights - expected right keys: ${JSON.stringify(expectedRightKeys)}`);
        console.error(`CheckDelegableRights - rights returned: ${JSON.stringify(rights.map((right) => ({ rightKey: right.rightKey, status: right.status })))}`);
    }

    return success;
}

/**
 * Checks that a delegation listing is shaped the way the pagination relies on.
 *
 * An instance with nothing delegated on it still answers with an empty data
 * array, so this deliberately says nothing about how many delegations there are.
 *
 * @param {AppsInstanceDelegationResponseDtoPaginated|null} delegations - The delegations listing.
 * @returns {boolean} True if the listing carries a data array, false otherwise.
 */
function CheckDelegationsShape(delegations) {
    const success = check(delegations, {
        "CheckDelegationsShape - Delegations listing carries a data array": (listing) =>
            Array.isArray(listing?.data),
    });

    if (!success) {
        console.error(`CheckDelegationsShape - delegations returned: ${JSON.stringify(delegations)}`);
    }

    return success;
}

/**
 * Checks that a request without a usable platform access token is turned away.
 *
 * An empty token fails the PlatformAccess policy before the controller runs, so
 * the answer is a bare 401 with no body to read.
 *
 * @param {object} response - The raw k6 response.
 * @returns {boolean} True if the request was rejected as expected, false otherwise.
 */
function CheckPlatformAccessTokenRejected(response) {
    const success = check(response, {
        "CheckPlatformAccessTokenRejected - Status code is 401": (res) => res.status === 401,
        "CheckPlatformAccessTokenRejected - No body is returned": (res) => !res.body,
    });

    if (!success) {
        console.error(`CheckPlatformAccessTokenRejected - expected 401 with no body, got ${response.status}: ${response.body}`);
    }

    return success;
}

/**
 * Checks that an app which does not own the resource is answered, but told
 * nothing.
 *
 * Access Management does not reject a performer that does not match the
 * resource. It answers 200 with an empty data array, the same shape as an app
 * that legitimately has nothing delegable, which is why a wrong org or app in
 * the token cannot be caught on the status code alone.
 *
 * @param {object} response - The raw k6 response.
 * @returns {boolean} True if the answer was an empty 200, false otherwise.
 */
function CheckNoRightsForOtherApp(response) {
    const success = check(response, {
        "CheckNoRightsForOtherApp - Status code is 200": (res) => res.status === 200,
        "CheckNoRightsForOtherApp - No rights are returned": (res) => {
            try {
                return (JSON.parse(res.body)?.data ?? []).length === 0;
            } catch {
                return false;
            }
        },
    });

    if (!success) {
        console.error(`CheckNoRightsForOtherApp - expected an empty 200, got ${response.status}: ${response.body}`);
    }

    return success;
}

export const AltinnAppsDomainChecks = {
    CheckDelegableRights,
    CheckDelegationsShape,
    CheckNoRightsForOtherApp,
    CheckPlatformAccessTokenRejected,
};
