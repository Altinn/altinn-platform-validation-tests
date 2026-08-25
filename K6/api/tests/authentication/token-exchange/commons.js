import { MaskinportenAccessTokenGenerator, MaskinportenTokenBuilder } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { AuthenticationClient } from "../../../authentication-imports.js";

/**
 * The organisation the Maskinporten client belongs to.
 *
 * The exchange derives the organisation from the consumer claim of the incoming
 * token, so this is what the exchanged token has to come back with. It is the
 * client the `313175650-maskinporten-client` secret in functional.yaml is for, the
 * same one the system register tests sign their grants with.
 */
export const CONSUMER_ORG_NO = "313175650";

/**
 * The scope the Maskinporten token is asked for, and the one the exchanged token
 * has to keep.
 */
export const SCOPE = AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE;

/**
 * k6 setup stage. Fetches the Maskinporten token the tests exchange.
 *
 * The token is test data here rather than plumbing: it is the thing under test, so
 * it is fetched where the other tests fetch their test data, and a run that cannot
 * sign the grant says so before any iteration starts rather than in the middle of
 * one.
 *
 * The token itself crosses into the iterations, not the generator: k6 serializes
 * the setup result to JSON and the prototypes would not survive. That also means
 * the token is not renewed while the run lasts, so this holds for a run that fits
 * inside the lifetime Maskinporten gave it. A load run would need a generator per
 * VU instead.
 *
 * @returns {Promise<{maskinportenToken: string}>} The token to exchange.
 */
export async function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return { maskinportenToken: await fetchMaskinportenToken() };
}

/**
 * Signs a grant and fetches a Maskinporten access token for the scope above.
 *
 * Async, unlike everything else here: signing goes through SubtleCrypto, which is
 * promise based.
 *
 * @returns {Promise<string>} The access token.
 */
export async function fetchMaskinportenToken() {
    const tokenGenerator = new MaskinportenAccessTokenGenerator(
        new MaskinportenTokenBuilder()
            .withScopes(CreateScopeString([SCOPE]))
            .build(),
    );

    return await tokenGenerator.ensureToken();
}

/**
 * Builds the client that exchanges a token.
 *
 * Takes the token rather than fetching one, so what a test does with the token and
 * where the token comes from stay apart.
 *
 * @param {string} maskinportenToken - The token from setup.
 * @returns {AuthenticationClient} The client, sending that token as its bearer.
 */
export function getClient(maskinportenToken) {
    return new AuthenticationClient(__ENV.BASE_URL, {
        // The clients ask a generator for a token per request. This one is already
        // fetched, so it only has to be handed over.
        getToken: () => maskinportenToken,
    });
}
