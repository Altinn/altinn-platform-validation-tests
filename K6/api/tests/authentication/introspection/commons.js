import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { IntrospectionClient } from "../../../authentication-imports.js";

/**
 * The organisation the token is minted for. Any organisation will do: the endpoint
 * answers about the token it is handed, not about who is asking.
 */
const ORG_NO = "312605031";

/**
 * @type {IntrospectionClient | undefined}
 */
let introspectionClient = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * k6 setup stage.
 *
 * Nothing to arrange: the token the test introspects is the one it authenticates
 * with, and that is minted per VU rather than in the setup.
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
