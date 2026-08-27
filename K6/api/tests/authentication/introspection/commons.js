import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
} from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { IntrospectionClient } from "../../../authentication-imports.js";

/**
 * The organisation the token is minted for. Any organisation will do: the endpoint
 * answers about the token it is handed, not about who is asking.
 */
const ORG_NO = "312605031";

/**
 * The issuer a platform access token comes back introspected as.
 *
 * The generator's `org` sets the issuer, and leaving it out defaults to `platform`.
 * It is passed explicitly anyway, so the test pins the issuer it mints rather than
 * asserting on an undocumented default. The endpoint echoes the issuer it read out
 * of the token it accepted, which is what makes this worth checking alongside the
 * active flag.
 */
export const PLATFORM_TOKEN_ISSUER = "platform";

/**
 * @type {IntrospectionClient | undefined}
 */
let introspectionClient = undefined;

/**
 * @type {PlatformTokenGenerator | undefined}
 */
let platformTokenGenerator = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * k6 setup stage.
 *
 * Nothing to arrange: every token this folder uses is minted per VU rather than in
 * the setup, both the enterprise token the calls authenticate with and the platform
 * access token the positive case introspects.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client this folder reads with.
 *
 * Built once per VU and reused across its iterations. The token generator caches
 * tokens per instance, so building it per iteration refetches the token from the
 * token generator service each time.
 *
 * The scope does not matter to the endpoint, but a token has to be minted with one,
 * so it is the narrowest of the authentication scopes. The generator stays out of
 * the return value: what a test needs to vary is what it sends, and the client
 * takes that per call.
 *
 * @returns {IntrospectionClient} The client.
 */
export function getClient() {
    if (introspectionClient === undefined || tokenGenerator === undefined) {
        tokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ]))
                .withOrganizationNumber(ORG_NO)
                .build(),
        );

        introspectionClient = new IntrospectionClient(__ENV.BASE_URL, tokenGenerator);
    }

    return introspectionClient;
}

/**
 * Mints the one kind of token the endpoint reports as active.
 *
 * Introspection runs the token past its validators in turn and answers active for
 * the first that accepts it. Only one is wired up, the eFormidling access token
 * validator, and what it takes is a platform access token: the token platform
 * components sign for each other, not a bearer any of the ordinary Altinn issuers
 * hands out. That is why an enterprise or personal token from the token generator,
 * and an Altinn token off the exchange, all come back inactive however they are
 * hinted.
 *
 * Cached per VU the way the client is, and kept apart from the client because this
 * token is only ever the subject of a call, never the bearer of one.
 *
 * @returns {string} A platform access token, issued as `PLATFORM_TOKEN_ISSUER`.
 */
export function getPlatformAccessToken() {
    if (platformTokenGenerator === undefined) {
        platformTokenGenerator = new PlatformTokenGenerator(
            new PlatformTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withOrganization(PLATFORM_TOKEN_ISSUER)
                .withTtl(3600)
                .build(),
        );
    }

    return platformTokenGenerator.getToken();
}
