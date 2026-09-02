import { AuthorizeClient } from "../../../clients/authorization/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

/**
 * @type {AuthorizeClient | undefined}
 */
let authorizeClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the client tests ask the policy decision point with.
 *
 * Here rather than in a test folder's commons because three folders now ask the pdp
 * and none of them owns it: pdp-authorize, which is about the endpoint itself, and
 * the two authentication tests that ask it whether a system user got the access it
 * was granted. Building it takes the same four decisions every time, and getting one
 * of them wrong shows up as a 401 rather than as a wrong answer.
 *
 * The two that are easy to get wrong: the pdp sits behind API management and answers
 * 401 without a subscription key, and it is asked on the authorize admin scope so
 * the answer is about the subject in the request rather than about whoever holds the
 * token. That also means one token serves every subject, so it is cached at module
 * scope and a VU fetches it once.
 *
 * @returns {[AuthorizeClient, PersonalTokenGenerator]} The client, and the generator behind it for callers that swap who they ask as.
 */
export function getAuthorizeClient() {
    if (authorizeClient === undefined || tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.AUTHORIZATION.AUTHORIZE.ADMIN]))
                .build(),
        );

        authorizeClient = new AuthorizeClient(__ENV.BASE_URL, tokenGenerator, __ENV.AUTHORIZATION_SUBSCRIPTION_KEY);
    }

    return [authorizeClient, tokenGenerator];
}
