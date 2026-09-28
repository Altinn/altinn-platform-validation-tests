import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * k6 setup function.
 *
 * Validates required environment variables before the test starts.
 *
 * @returns {void}
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client used to interact with the Roles API.
 *
 * The same {@link RolesClient} instance is reused across iterations.
 *
 * @returns {[RolesClient]} Tuple containing the Roles API client.
 */
const getClients = lazy(function () {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    /** @type {[RolesClient]} */
    const clients = [
        new RolesClient(__ENV.BASE_URL, new PersonalTokenGenerator(tokenOpts)),
    ];

    return clients;
});

export { getClients };
