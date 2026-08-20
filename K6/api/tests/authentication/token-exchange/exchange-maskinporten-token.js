import { fail, group } from "k6";

import { MaskinportenAccessTokenGenerator, MaskinportenTokenBuilder } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { AuthenticationBuildingBlocks, AuthenticationClient, TokenExchangeDomainChecks } from "../../../authentication-imports.js";

/**
 * The organisation the Maskinporten client belongs to.
 *
 * The exchange derives the organisation from the consumer claim of the incoming
 * token, so this is what the exchanged token has to come back with. It is the
 * client the `313175650-maskinporten-client` secret in functional.yaml is for, the
 * same one the system register tests use.
 */
const CONSUMER_ORG_NO = "313175650";

/**
 * The scope the Maskinporten token is asked for, and the one the exchanged token
 * has to keep.
 */
const SCOPE = AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE;

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: a Maskinporten token can be exchanged for an Altinn token.
 *
 * The exchange is how every enterprise integration gets into Altinn, and it had no
 * test anywhere, which is what issue #432 called the most important gap. The other
 * tests in this repo go through the token generator service instead, so nothing
 * covered the endpoint itself.
 *
 * The rejections are covered too, since an endpoint that hands out tokens for
 * anything it is given is worse than one that is down: a provider it does not know
 * has to be refused, and so has a request without a readable token.
 */
export default async function () {
    const tokenGenerator = new MaskinportenAccessTokenGenerator(
        new MaskinportenTokenBuilder()
            .withScopes(CreateScopeString([SCOPE]))
            .build(),
    );

    // Signing the grant goes through SubtleCrypto, so the token has to be fetched
    // before the client starts asking for it.
    await tokenGenerator.ensureToken();

    const authenticationClient = new AuthenticationClient(__ENV.BASE_URL, tokenGenerator);

    group("As an enterprise integration, I can exchange my Maskinporten token for an Altinn token", function () {
        group("Exchange the Maskinporten token", function () {
            const altinnToken = AuthenticationBuildingBlocks.ExchangeToken(authenticationClient, "maskinporten");

            // The claims are the point of the exchange, so a call that came back
            // without a token ends the group here rather than reporting every claim
            // as missing.
            if (!TokenExchangeDomainChecks.CheckTokenExchanged(altinnToken)) {
                fail("cannot check the claims: the exchange did not return a token");
            }

            TokenExchangeDomainChecks.CheckExchangedTokenClaims(altinnToken, {
                orgNumber: CONSUMER_ORG_NO,
                scope: SCOPE,
            });
        });

        group("A provider the endpoint does not know is refused", function () {
            AuthenticationBuildingBlocks.ExchangeToken(authenticationClient, "not-a-token-provider", {}, 400);
        });

        group("A request without a token is refused", function () {
            AuthenticationBuildingBlocks.ExchangeToken(authenticationClient, "maskinporten", { token: null }, 401);
        });

        group("A token the endpoint cannot read is refused", function () {
            AuthenticationBuildingBlocks.ExchangeToken(authenticationClient, "maskinporten", { token: "not-a-jwt" }, 401);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
