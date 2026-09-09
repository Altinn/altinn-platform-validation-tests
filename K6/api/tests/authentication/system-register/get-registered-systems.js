import { group } from "k6";

import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { SystemRegisterBuildingBlocks, SystemRegisterClient, SystemRegisterDomainChecks } from "../../../authentication-imports.js";

/**
 * Creates and caches the client this test reads with.
 *
 * Listing the register is what the portal does when a customer picks a system, so
 * it goes with a personal token and the portal scope, unlike the vendor tests in
 * this folder. Nobody in particular needs to be logged in for the list, so the
 * token is not built for a user.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {SystemRegisterClient} The client.
 */
const getClient = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .build(),
    );

    return new SystemRegisterClient(__ENV.BASE_URL, tokenGenerator);
});

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Test: the register lists the systems a customer can pick from.
 *
 * The vendor tests in this folder register, change and delete one system each. The
 * list every customer sees had no test, which is what issue #432 pointed out.
 */
export default function () {
    group("As an end user, I can list the registered systems", function () {
        const systems = SystemRegisterBuildingBlocks.Get(getClient());

        SystemRegisterDomainChecks.CheckRegisteredSystemsListed(systems);
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
