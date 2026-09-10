import { check } from "k6";

import { readClaims } from "../common/jwt.js";

/**
 * Checks that the exchange handed back a token.
 *
 * @param {string|null} token - The token the exchange returned.
 * @returns {boolean} True if a readable JWT came back, false otherwise.
 */
function CheckTokenExchanged(token) {
    const parts = (token ?? "").split(".");

    const success = check(token, {
        "CheckTokenExchanged - The exchange returned a JWT": () =>
            parts.length === 3 && parts.every((part) => part.length > 0),
    });

    if (!success) {
        console.error(`CheckTokenExchanged - expected a JWT, got: ${JSON.stringify(token)}`);
    }

    return success;
}

/**
 * Checks that the exchanged token carries the claims the rest of Altinn authorises on.
 *
 * The organisation is what the exchange derives from the consumer claim of the
 * incoming token, so it is the one claim that says the exchange looked at the token
 * it was given rather than handing out something generic. The authentication method
 * and level are what a service checks before it lets the caller in.
 *
 * @param {string|null} token - The token the exchange returned.
 * @param {{orgNumber: string, scope: string}} expected - The organisation the incoming token belonged to, and a scope it carried.
 * @returns {boolean} True if the claims are as expected, false otherwise.
 */
function CheckExchangedTokenClaims(token, expected) {
    const claims = readClaims(token);

    const success = check(claims, {
        "CheckExchangedTokenClaims - Token is issued for the organisation of the exchanged token": (found) =>
            found?.["urn:altinn:orgNumber"] === expected.orgNumber,
        "CheckExchangedTokenClaims - Token says it was authenticated with maskinporten at level 3": (found) =>
            found?.["urn:altinn:authenticatemethod"] === "maskinporten" &&
            `${found?.["urn:altinn:authlevel"]}` === "3",
        "CheckExchangedTokenClaims - Token keeps the scope the exchanged token carried": (found) =>
            `${found?.scope ?? ""}`.split(" ").includes(expected.scope),
    });

    if (!success) {
        console.error(`CheckExchangedTokenClaims - expected: ${JSON.stringify(expected)}`);
        console.error(`CheckExchangedTokenClaims - claims returned: ${JSON.stringify(claims)}`);
    }

    return success;
}

export const TokenExchangeDomainChecks = {
    CheckExchangedTokenClaims,
    CheckTokenExchanged,
};
