import { check } from "k6";
import encoding from "k6/encoding";

/**
 * Reads the claims out of a JWT without verifying it.
 *
 * The same reasoning as in token-exchange.js: verifying the signature would mean
 * fetching signing keys and doing crypto in the test, which says more about the
 * test than about what issued the token. What matters here is which claims the
 * token carries, so the payload is read and the signature left to the services
 * that consume it.
 *
 * @param {string|null} token - The token to read.
 * @returns {any|null} The claims, or null when the token is not a readable JWT.
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
 * What a system user token has to say about the system user it was issued for.
 *
 * @typedef {object} ExpectedSystemUser
 * @property {string} id Identifier of the system user.
 * @property {string} systemId Identifier of the system the system user belongs to.
 * @property {string} orgNo Organisation number of the organisation that holds the system user.
 */

/**
 * Checks that a token names the system user it was asked for.
 *
 * The `authorization_details` claim is the whole point of the token: it is what
 * tells the api the caller reaches that it is acting as a particular system user
 * for a particular organisation, and the only part an ordinary enterprise token
 * does not have. So it is checked entry by entry rather than as a whole.
 *
 * Takes both the Maskinporten token and the Altinn token the exchange hands back,
 * since the exchange is supposed to carry the claim across untouched. Maskinporten
 * answers with an array, as the grant asks with one, while the Altinn token carries
 * the single entry as an object, so both shapes are read the same way here.
 *
 * @param {string|null} token - The token to check.
 * @param {ExpectedSystemUser} expected - The system user the token was asked for.
 * @param {string} operation - Name of the operation, used in the check names and logs.
 * @returns {boolean} True if the token carries those claims, false otherwise.
 */
function CheckSystemUserTokenClaims(token, expected, operation) {
    const claims = readClaims(token);
    const found = claims?.authorization_details;
    const details = Array.isArray(found) ? (found.length === 1 ? found[0] : null) : (found ?? null);

    const success = check(details, {
        [`CheckSystemUserTokenClaims - ${operation} is a system user token`]: (entry) =>
            entry?.type === "urn:altinn:systemuser",
        [`CheckSystemUserTokenClaims - ${operation} names the organisation that holds the system user`]: (entry) =>
            entry?.systemuser_org?.authority === "iso6523-actorid-upis" &&
            entry?.systemuser_org?.ID === `0192:${expected.orgNo}`,
        [`CheckSystemUserTokenClaims - ${operation} names the system user it was asked for`]: (entry) =>
            Array.isArray(entry?.systemuser_id) && entry.systemuser_id.includes(expected.id),
        [`CheckSystemUserTokenClaims - ${operation} names the system the system user belongs to`]: (entry) =>
            entry?.system_id === expected.systemId,
    });

    const expires = check(claims, {
        [`CheckSystemUserTokenClaims - ${operation} expires, and has not already`]: (found) =>
            typeof found?.exp === "number" && found.exp * 1000 > Date.now(),
    });

    if (!success || !expires) {
        console.error(`CheckSystemUserTokenClaims - ${operation} expected: ${JSON.stringify(expected)}`);
        console.error(`CheckSystemUserTokenClaims - ${operation} claims returned: ${JSON.stringify(claims)}`);
    }

    return success && expires;
}

export const SystemUserTokenDomainChecks = {
    CheckSystemUserTokenClaims,
};
