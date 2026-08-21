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
 * @type {AuthenticationClient | undefined}
 */
let authenticationClient = undefined;

/**
 * k6 setup stage. Declares what the tests in this folder need.
 *
 * The Maskinporten grant is signed per VU rather than here, since the generator
 * cannot be handed over: k6 serializes the setup result to JSON and the prototypes
 * would not survive.
 *
 * @returns {undefined} Nothing, the tests draw no test data.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client these tests exchange tokens with.
 *
 * Async, unlike most client helpers in this repo: signing the Maskinporten grant
 * goes through SubtleCrypto, so the token has to be fetched before the client
 * starts asking for it.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than signing a new grant on every iteration.
 *
 * @returns {Promise<AuthenticationClient>} The client, holding the Maskinporten token that gets exchanged.
 */
export async function getClient() {
    if (authenticationClient === undefined) {
        const tokenGenerator = new MaskinportenAccessTokenGenerator(
            new MaskinportenTokenBuilder()
                .withScopes(CreateScopeString([SCOPE]))
                .build(),
        );

        await tokenGenerator.ensureToken();

        authenticationClient = new AuthenticationClient(__ENV.BASE_URL, tokenGenerator);
    }

    return authenticationClient;
}
