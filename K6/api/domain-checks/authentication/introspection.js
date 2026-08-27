import { check } from "k6";

import { IntrospectionResponse } from "../../../clients/authentication/types.js";

/**
 * Checks that an introspection answer says whether the token was valid.
 *
 * The answer is a single flag, so an answer without it says nothing at all, and a
 * body where the flag is missing or is not a boolean is what this catches.
 *
 * @param {IntrospectionResponse|null} introspection - The introspection response.
 * @returns {boolean} True if the answer carries the flag, false otherwise.
 */
function CheckIntrospectionAnswered(introspection) {
    const success = check(introspection, {
        "CheckIntrospectionAnswered - The answer says whether the token is active": (response) =>
            typeof response?.active === "boolean",
    });

    if (!success) {
        console.error(`CheckIntrospectionAnswered - introspection returned: ${JSON.stringify(introspection)}`);
    }

    return success;
}

/**
 * Checks that a token was accepted.
 *
 * The issuer is checked alongside the flag rather than on its own. The endpoint
 * only fills `iss` in when it accepted the token, so the two travel together, and
 * an answer that turned active while naming some other issuer is a different
 * validator having claimed the token than the one the test meant to exercise.
 *
 * @param {IntrospectionResponse|null} introspection - The introspection response.
 * @param {string} expectedIssuer - The issuer the answer has to name.
 * @returns {boolean} True if the token was reported active and issued by that issuer, false otherwise.
 */
function CheckTokenActive(introspection, expectedIssuer) {
    const success = check(introspection, {
        "CheckTokenActive - The token is reported active": (response) =>
            response?.active === true,
        "CheckTokenActive - The answer names the issuer that signed the token": (response) =>
            response?.iss === expectedIssuer,
    });

    if (!success) {
        console.error(`CheckTokenActive - introspection returned: ${JSON.stringify(introspection)}`);
    }

    return success;
}

/**
 * Checks that a token was rejected.
 *
 * @param {IntrospectionResponse|null} introspection - The introspection response.
 * @returns {boolean} True if the token was reported inactive, false otherwise.
 */
function CheckTokenInactive(introspection) {
    const success = check(introspection, {
        "CheckTokenInactive - The token is reported inactive": (response) =>
            response?.active === false,
    });

    if (!success) {
        console.error(`CheckTokenInactive - introspection returned: ${JSON.stringify(introspection)}`);
    }

    return success;
}

export const IntrospectionDomainChecks = {
    CheckIntrospectionAnswered,
    CheckTokenActive,
    CheckTokenInactive,
};
