
import { AuthorizedPartiesClient } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData } from "../../../../../helpers.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * @type {AuthorizedPartiesClient | undefined}
 */
let authorizedPartiesClient = undefined;

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
export function getClients() {
    const scopes = CreateScopeString([
        AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.RESOURCEOWNER
    ]);
    if (authorizedPartiesClient == undefined) {
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);

        authorizedPartiesClient = new AuthorizedPartiesClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [authorizedPartiesClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return fetchTestData(`access-management/resource-owner/get-authorized-parties/${__ENV.ENVIRONMENT}.csv`);
}
