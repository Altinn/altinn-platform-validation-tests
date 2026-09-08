import { fail, group } from "k6";

import { IntrospectionBuildingBlocks, IntrospectionDomainChecks } from "../../../authentication-imports.js";
import { getClient, getPlatformAccessToken, PLATFORM_TOKEN_ISSUER } from "./commons.js";

export { setup } from "./commons.js";

/**
 * What a refusal of an empty token says. Loose on purpose: the endpoint spells it
 * "Token canot be empty." today, and the point is to tell its own refusal apart from
 * any other response carrying the same status, such as one from APIM in front of it,
 * not to freeze the typo.
 */
const EMPTY_TOKEN_REFUSAL = /token/i;

/**
 * Test: the introspection endpoint, which says whether a token is valid.
 *
 * What the test asserts is the contract: the endpoint wants a bearer of its own and
 * answers 401 without one, a token that is empty or left out is refused with 400 and
 * says why, and anything it can be handed comes back as an answer rather than as a
 * 500.
 *
 * Both answers are covered, which is what makes the negative ones worth anything:
 * a token that comes back active proves the endpoint reads what it is handed, so an
 * inactive answer elsewhere is a refusal rather than an endpoint that never looked.
 *
 * Which token comes back active is narrower than it first appears. The endpoint
 * tries its validators in turn and answers active for the first that accepts the
 * token, and only one is wired up: the eFormidling access token validator, which
 * takes platform access tokens. Ordinary Altinn bearers are not that, so the
 * enterprise and personal tokens the rest of this repo runs on come back inactive,
 * and so does an Altinn token off the exchange. See #463.
 */
export default function () {
    const introspectionClient = getClient();

    group("As a caller, I can ask whether a token is valid", function () {
        group("Introspecting a token answers whether it is active", function () {
            // The hint is what a caller that knows what it holds sends along.
            const introspection = IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { tokenTypeHint: "access_token" });

            // Reporting the answer as missing on top of a call that already failed
            // says the same thing twice and points at the wrong check.
            if (introspection === null) {
                fail("cannot read the answer: the introspection call did not return one");
            }

            IntrospectionDomainChecks.CheckIntrospectionAnswered(introspection);
        });

        group("A token the endpoint cannot read still gets an answer", function () {
            const introspection = IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: "not-a-jwt" });

            IntrospectionDomainChecks.CheckTokenInactive(introspection);
        });

        group("An empty token is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: "" }, 400, EMPTY_TOKEN_REFUSAL);
        });

        // The endpoint treats a missing token as an empty one, down to the same
        // message. The two are covered apart so a change to either is noticed.
        group("A body without a token is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: null }, 400, EMPTY_TOKEN_REFUSAL);
        });

        // The token stays in the body while the header is dropped, so a regression
        // where the endpoint accepts the introspected token as the caller's own
        // authentication would answer 200 and turn this group red.
        group("A request without a bearer is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { bearer: null }, 401);
        });

        // Last on purpose. This is the only group that depends on a second token
        // generator endpoint, and both a non-200 from it and a fail() here abort the
        // whole iteration, which would take the four groups above with it. Nothing
        // fails hard: CheckTokenActive already fails closed on a missing answer, so a
        // generator that is cold or down degrades the run instead of cutting it.
        group("A platform access token is reported active", function () {
            // The bearer stays the client's own enterprise token. Only the
            // introspected token is swapped, since the two are separate concerns
            // here and the endpoint answers about the one in the body.
            const introspection = IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, {
                token: getPlatformAccessToken(),
            });

            IntrospectionDomainChecks.CheckTokenActive(introspection, PLATFORM_TOKEN_ISSUER);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
