import encoding from "k6/encoding";

/**
 * Reads the claims out of a JWT without verifying it.
 *
 * Verifying the signature would mean fetching the issuer's signing keys and doing
 * crypto in the test, which says more about the test than about what issued the
 * token. What the tests here are about is which claims a token carries, so the
 * payload is read and the signature left to the services that consume it.
 *
 * Cross-area, like everything else in domain-checks/common, so it stays out of the
 * area barrels: two of them re-exporting it would make a test that imports both
 * fail on a duplicate binding. Import it directly.
 *
 * @param {string|null} token - The token to read.
 * @returns {any|null} The claims, or null when the token is not a readable JWT.
 */
export function readClaims(token) {
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
