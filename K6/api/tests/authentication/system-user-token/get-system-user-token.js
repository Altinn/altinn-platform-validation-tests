import { group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { SystemUserTokenDomainChecks } from "../../../authentication-imports.js";
import { fetchSystemUserToken } from "./commons.js";

export { setup, teardown } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Test: a system vendor can get a Maskinporten token that acts as its customer's
 * system user.
 *
 * This is how an integration actually reaches Altinn on a customer's behalf, and
 * nothing here covered it: every other test in this repo mints its tokens from the
 * token generator service, which hands out whatever it is asked for. Maskinporten
 * does not. It looks the system user up in Altinn while it issues the token, from
 * the client the grant is signed by and the organisation the grant names, so a
 * token that comes back is Altinn confirming the system user exists and belongs to
 * that client.
 *
 * What the token has to carry is the `authorization_details` claim, since that is
 * the part an ordinary enterprise token does not have and the part everything
 * downstream authorises on.
 *
 * The grant is fetched outside the group, since signing it is asynchronous and k6
 * groups take a synchronous callback.
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

    group("As a system vendor, I can get a Maskinporten token for my customer's system user", function () {
        SystemUserTokenDomainChecks.CheckSystemUserTokenClaims(
            systemUserToken,
            {
                id: arranged.systemUserId,
                systemId: arranged.systemId,
                orgNo: arranged.customer.orgNo,
            },
            "the Maskinporten token",
        );
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
