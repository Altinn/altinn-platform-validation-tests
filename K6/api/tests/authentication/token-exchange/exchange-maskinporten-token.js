import { fail, group } from "k6";

import { AuthenticationBuildingBlocks, TokenExchangeDomainChecks } from "../../../authentication-imports.js";
import { CONSUMER_ORG_NO, getClient, SCOPE } from "./commons.js";

export { setup } from "./commons.js";

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
 *
 * @param {object} data The Maskinporten token from setup.
 */
export default function (data) {
    const authenticationClient = getClient(data.maskinportenToken);

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
