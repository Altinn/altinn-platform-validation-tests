import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { AuthorizedPartiesClient } from "../../../../clients/access-management/enduser/authorized-parties/index.js";
import { getItemFromList } from "../../../../helpers.js";
import { AltinnScopes } from "../../../../scopes.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/index.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/enduser/authorized-parties.js";
import { fetchSystemUserToken } from "./commons.js";

export { setup, teardown } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Test: a system user sees the access package the customer approved for it in
 * /authorizedparties.
 *
 * Setup gives the system user one access package on the customer. Calling the end
 * user endpoint with the system user token should list the customer with exactly
 * that package.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The arranged system users from setup.
 */
export default async function (data) {
    // Empty outside tt02, where setup has nothing to arrange. See its comment.
    if ((data ?? []).length === 0) {
        return;
    }

    const arranged = getItemFromList(data, randomize);
    const systemUserToken = await fetchSystemUserToken(arranged, [AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT]);

    const authorizedPartiesClient = new AuthorizedPartiesClient(__ENV.BASE_URL, {
        getToken: () => systemUserToken,
    });

    group("As a system user, I see the access package my customer gave me", function () {
        const query = new EndUserAuthorizedPartiesQueryBuilder()
            .includeAccessPackages(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, query, null);
        const parties = authorizedParties?.data ?? null;

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, arranged.customer.orgPartyUuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, arranged.customer.orgPartyUuid, ["jordbruk"]);
    });
}
