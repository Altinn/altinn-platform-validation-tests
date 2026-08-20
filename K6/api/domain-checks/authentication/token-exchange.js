import { check } from "k6";
import encoding from "k6/encoding";

/**
 * Reads the claims out of a JWT without verifying it.
 *
 * Verifying the signature would mean fetching Altinn's signing keys and doing
 * crypto in the test, which says more about the test than about the endpoint. What
 * the exchange has to get right is which claims come back, so the payload is read
 * and the signature left to the services that consume the token.
 *
 * @param {string|null} token - The token to read.
 * @returns {object|null} The claims, or null when the token is not a readable JWT.
 */
function readClaims(token) {
    const parts = (token ?? "").split(".");

    if (parts.length !== 3) {
        return null;
    }

    try {
        // A JWT is base64url encoded and unpadded, which is what "rawurl" means.
        return JSON.parse(encoding.b64decode(parts[1], "rawurl", "s"));
    } catch (error) {
        console.error(`readClaims - cannot read the token payload: ${error}`);

        return null;
    }
}

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
