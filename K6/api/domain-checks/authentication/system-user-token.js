import { check } from "k6";

import { readClaims } from "../common/jwt.js";

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
        [`CheckSystemUserTokenClaims - ${operation} expires, and has not already`]: (payload) =>
            typeof payload?.exp === "number" && payload.exp * 1000 > Date.now(),
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
