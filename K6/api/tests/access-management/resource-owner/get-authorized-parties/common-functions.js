
import { AuthorizedPartiesClient } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy } from "../../../../../helpers.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * Creates and caches the client used to interact with the
 * Authorized Parties API.
 *
 * The client uses an enterprise token with the
 * `altinn:accessmanagement/authorizedparties.resourceowner` scope.
 * The same {@link AuthorizedPartiesClient} instance is reused on
 * subsequent calls.
 *
 * @returns {[AuthorizedPartiesClient]} The initialized API client.
 */
export const getClients = lazy(function () {
    const scopes = CreateScopeString([
        AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.RESOURCEOWNER
    ]);
    const tokenOpts = new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    /** @type {[AuthorizedPartiesClient]} */
    const clients = [
        new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts)),
    ];

    return clients;
});

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`access-management/resource-owner/get-authorized-parties/${__ENV.ENVIRONMENT}.csv`);
}
