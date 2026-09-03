import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { AuthenticationBuildingBlocks, SystemUserTokenDomainChecks, TokenExchangeDomainChecks } from "../../../authentication-imports.js";
import { fetchSystemUserToken, getClients, SCOPE } from "./commons.js";

export { setup, teardown } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Test: a system user token can be exchanged for an Altinn token that still acts as
 * the system user.
 *
 * The exchange is the step between holding a Maskinporten token and being able to
 * call anything in Altinn with it, and exchange-maskinporten-token.js only covers it
 * for an ordinary enterprise token. A system user token carries one claim more than
 * that one, `authorization_details`, and it is the claim the whole system user
 * feature rests on: an exchange that dropped it would hand back a token that acts as
 * the vendor organisation rather than as the customer's system user, which every
 * status code involved would call a success.
 *
 * The organisation claim is checked too, and is the vendor rather than the customer:
 * the exchange derives it from the consumer of the incoming token, which is whoever
 * signed the grant.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The arranged system users from setup.
 */
export default async function (data) {
    // Empty outside tt02, where setup has nothing to arrange. See its comment.
    if ((data ?? []).length === 0) {
        return;
    }

    const arranged = getItemFromList(data, randomize);
    const systemUserToken = await fetchSystemUserToken(arranged);
    const { clients } = getClients();

    group("As a system vendor, I can exchange my system user token for an Altinn token", function () {
        const altinnToken = AuthenticationBuildingBlocks.ExchangeToken(
            clients.authenticationClient,
            "maskinporten",
            { token: systemUserToken },
        );

        // The claims are the point of the exchange, so a call that came back without
        // a token ends here rather than reporting every claim as missing.
        if (!TokenExchangeDomainChecks.CheckTokenExchanged(altinnToken)) {
            fail("cannot check the claims: the exchange did not return a token");
        }

        group("The Altinn token still acts as the system user", function () {
            SystemUserTokenDomainChecks.CheckSystemUserTokenClaims(
                altinnToken,
                {
                    id: arranged.systemUserId,
                    systemId: arranged.systemId,
                    orgNo: arranged.customer.orgNo,
                },
                "the exchanged token",
            );
        });

        group("The Altinn token says how the caller authenticated", function () {
            TokenExchangeDomainChecks.CheckExchangedTokenClaims(altinnToken, {
                orgNumber: arranged.vendorOrgNo,
                scope: SCOPE,
            });
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
