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
    CheckTokenInactive,
};
